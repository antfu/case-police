import { createEslintRule } from '../utils'
import dict from '../../dict-temp.json'
import { replaceProcess } from './../../../../src/utils'

export const RULE_NAME = 'string-check'
export type MessageIds = 'spellError'
export type Options = []

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'make the case correct in string',
      recommended: 'warn',
    },
    fixable: 'code',
    schema: [],
    messages: {
      spellError: 'make the case correct in string',
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      Literal: async (node) => {
        if (typeof node.value === 'string') {
          const replaced = replaceProcess(node.value, dict, [])

          if (replaced) {
            context.report({
              messageId: 'spellError',
              node,
              fix(fixer) {
                return fixer.replaceTextRange([node.range[0], node.range[1]], `'${replaced}'`)
              },
            })
          }
        }
      },
    }
  },
})
