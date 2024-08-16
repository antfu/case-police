import { join } from 'node:path'
import type { RuleListener } from '@typescript-eslint/utils/ts-eslint'
import type { TSESTree } from '@typescript-eslint/utils'
import { createSyncFn } from 'synckit'
import { replaceCore } from 'case-police'
import { createEslintRule } from '../utils'
import { distDir } from '../dirs'
import type { RuleOption } from '../types'

export const RULE_NAME = 'string-check'
export type MessageIds = 'CasePoliceError'

const loadDict = createSyncFn<(options: RuleOption) => Promise<Record<string, string>>>(join(distDir, 'worker-load.cjs'))

export default createEslintRule<[RuleOption], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'make the case correct in string',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          dict: {
            description: 'Custom dictionary, will be merged with original dict.',
            type: 'object',
          },
          noDefault: {
            description: 'Disable the default dictionary.',
            type: 'boolean',
          },
          presets: {
            description: 'Filter the default presets.',
            type: 'array',
          },
          ignore: {
            description: 'Ignore some words.',
            type: 'array',
          },
        },
      },
    ],
    messages: {
      CasePoliceError: '\'{{ from }}\' should be \'{{ to }}\'.',
    },
  },
  defaultOptions: [
    {
      noDefault: false,
      dict: {},
      presets: [],
      ignore: [],
    },
  ],
  create: (context, [options]) => {
    const dict = loadDict(options)
    const code = context.sourceCode.text

    const checkText = (node: TSESTree.Node) => {
      const start = node.range[0]
      const end = node.range[1]
      const originalStr = code.slice(start, end)
      const outputs: { from: string, to: string, index: number }[] = []

      replaceCore(originalStr, dict, options.ignore, (_, index, from, to) => {
        outputs.push({ index, from, to })
      })

      for (const { from, to, index } of outputs) {
        const loc = {
          ...node.loc.start,
        }

        for (let i = 0; i < index; i++) {
          if (originalStr[i] === '\n') {
            loc.line++
            loc.column = 0
          }
          else {
            loc.column++
          }
        }

        context.report({
          messageId: 'CasePoliceError',
          data: { from, to },
          node,
          *fix(fixer) {
            yield fixer.replaceTextRange([start + index, start + index + from.length], to)
          },
          loc: {
            start: loc,
            end: {
              line: loc.line,
              column: loc.column + from.length,
            },
          },
        })
      }
    }

    const scriptVisitor: RuleListener = {
      Literal: (node) => {
        if (typeof node.value === 'string')
          checkText(node)
      },
      JSXText: (node) => {
        checkText(node)
      },
      TemplateElement: (node) => {
        checkText(node)
      },
    }

    const templateBodyVisitor: RuleListener = {
      VText(node: any) {
        checkText(node)
      },
    }

    // @ts-expect-error missing-types
    if (context.parserServices == null || context.parserServices?.defineTemplateBodyVisitor == null)
      return scriptVisitor
    else
      // @ts-expect-error missing-types
      return context.parserServices?.defineTemplateBodyVisitor(templateBodyVisitor, scriptVisitor)
  },

})
