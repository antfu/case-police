import type { RuleListener } from '@typescript-eslint/utils/dist/ts-eslint'
import type { TSESTree } from '@typescript-eslint/utils'
import type { Option } from '../../../utils/mergeDict'
import { mergeDict } from '../../../utils/mergeDict'
import { createEslintRule } from '../utils'
import { replaceCore } from './../../../../src/utils'

export const RULE_NAME = 'string-check'
export type MessageIds = 'spellError'

export type Options = [Option]

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'make the case correct in string',
      recommended: 'warn',
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
        },
      },
    ],
    messages: {
      spellError: 'make the case correct in string',
    },
  },
  defaultOptions: [
    {
      noDefault: false,
      dict: {},
      presets: [],
    },
  ],
  create: (context, [options]) => {
    const dict = mergeDict(options)
    const code = context.getSourceCode().text

    const checkText = (node: TSESTree.JSXText) => {
      const replaced = replaceCore(node.value, dict, [])

      if (replaced) {
        context.report({
          messageId: 'spellError',
          node,
          fix(fixer) {
            return fixer.replaceTextRange([node.range[0] + 1, node.range[1] - 1], replaced)
          },
        })
      }
    }

    const scriptVisitor: RuleListener = {
      Literal: (node) => {
        if (typeof node.value === 'string') {
          const replaced = replaceCore(node.value, dict, [])

          if (replaced) {
            context.report({
              messageId: 'spellError',
              node,
              fix(fixer) {
                return fixer.replaceTextRange(
                  [node.range[0] + 1, node.range[1] - 1],
                  replaced.replaceAll('\n', '\\n'),
                )
              },
            })
          }
        }
      },
      JSXText: (node) => {
        checkText(node)
      },
      TemplateElement: (node) => {
        const originalStr = code.slice(node.range[0], node.range[1])
        const replaced = replaceCore(originalStr, dict, [])

        if (replaced) {
          context.report({
            messageId: 'spellError',
            node,
            fix(fixer) {
              return fixer.replaceText(node, replaced)
            },
          })
        }
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
