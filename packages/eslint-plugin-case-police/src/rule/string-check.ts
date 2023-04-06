import { createEslintRule } from '../utils'
import orginDict from '../../dict-temp.json'
import { replaceCore } from './../../../../src/utils'

export const RULE_NAME = 'string-check'
export type MessageIds = 'spellError'
export type Presets = 'softwares' | 'products' | 'general' | 'brands' | 'abbreviates'
export type Options = [
  {
    dict?: Record<string, string>
    noDefault?: boolean
    presets?: Presets[]
  },
]

function mergeDict(options: Options[0]) {
  const dictionary = {}

  if (options.presets?.length) {
    Object.assign(
      dictionary,
      ...options.presets.map(preset => (orginDict?.[preset]) ?? {}),
    )
  }
  else {
    Object.assign(
      dictionary,
      ...Object.values(orginDict),
    )
  }
  const dict = options.noDefault ? {} : dictionary

  return {
    ...dict,
    ...options.dict,
  }
}

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

    return {
      Literal: (node) => {
        if (typeof node.value === 'string') {
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
      },
      // TemplateElement: (node) => {
      //   const replaced = replaceCore(node.value.raw, dict, [])

      //   if (replaced) {
      //     context.report({
      //       messageId: 'spellError',
      //       node,
      //       fix(fixer) {
      //         return fixer.replaceTextRange([node.range[0] + 1, node.range[1] - 1], replaced)
      //       },
      //     })
      //   }
      // },
    }
  },
})
