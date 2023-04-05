import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint'
import { it } from 'vitest'
import type { Options } from './string-check'
import rule, { RULE_NAME } from './string-check'

const valids: ([string, Options] | [string])[] = [
  ['const a="Ant Design"'],
  ['const a="iOc"', [{ presets: ['softwares'] }]],
]

const invalids: ([string, string, Options] | [string, string])[] = [
  ['const a="Typescript"', 'const a="TypeScript"'],
  ['const a="Typescript and Javascript"', 'const a="TypeScript and JavaScript"'],
  ['const a={name:"Ant design"}', 'const a={name:"Ant Design"}'],
  ['const a="nintendo Switch and Javascript"', 'const a="Nintendo Swicth and JavaScript"', [{ dict: { 'nintendo switch': 'Nintendo Swicth' } }]],
  ['const a="nintendo Switch and Javascript"', 'const a="Nintendo Swicth and Javascript"', [{ dict: { 'nintendo switch': 'Nintendo Swicth' }, noDefault: true }]],
  ['const a="alphaGo"', 'const a="AlphaGo"', [{ presets: ['brands'] }]],
]

it('runs', () => {
  const ruleTester: RuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  })

  ruleTester.run(RULE_NAME, rule, {
    valid: valids.map(i => i[1]
      ? ({
          code: i[0],
          options: i?.[1],
        })
      : ({ code: i[0] })),
    invalid: invalids.map(i => i[2]
      ? ({
          code: i[0],
          output: i[1],
          options: i?.[2],
          errors: [{ messageId: 'spellError' }],
        })
      : ({
          code: i[0],
          output: i[1],
          errors: [{ messageId: 'spellError' }],
        })),
  })
})
