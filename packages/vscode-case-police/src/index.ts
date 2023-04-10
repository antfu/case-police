import type { DecorationOptions, TextDocument } from 'vscode'
import { Range, window, workspace } from 'vscode'
import isTextPath from 'is-text-path'
import { replaceCore } from '../../../src/utils'
import { mergeDict } from '../../utils/mergeDict'

// TODO: presets AND ignore
export function activate() {
  const dict = mergeDict({
    noDefault: workspace.getConfiguration().get('casePolice.noDefault') ?? false,
    dict: workspace.getConfiguration().get('casePolice.dict') ?? {},
    presets: [],
  })

  const decorationType = window.createTextEditorDecorationType({
    textDecoration: 'none; border-bottom: 1px dashed red',
  })

  workspace.onDidChangeTextDocument((event) => {
    updateDecorations(event.document)
  })

  window.onDidChangeActiveTextEditor((editor) => {
    updateDecorations(editor?.document)
  })

  function updateDecorations(document?: TextDocument) {
    const editor = window.activeTextEditor

    if (editor && document === editor.document && isTextPath(editor.document.fileName)) {
      const errors: DecorationOptions[] = []

      replaceCore(document.getText(), dict, [], (code, offset, original, replaced) => {
        const startPos = document.positionAt(offset)
        const endPos = document.positionAt(offset + original.length)

        errors.push({
          range: new Range(startPos, endPos),
          hoverMessage: `Make the case correct 【 --> ${replaced} 】`,
        })
      })

      editor.setDecorations(decorationType, errors)
    }
  }

  updateDecorations(window.activeTextEditor?.document)
}
