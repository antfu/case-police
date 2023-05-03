import fs from 'node:fs'
import path from 'node:path'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint'
import { it } from 'vitest'
import type { RuleOption } from '../types'
import rule, { RULE_NAME } from './string-check'

const valids: ([string, [RuleOption]] | [string])[] = [
  ['const a="Ant Design"'],
  ['const a="iOc"', [{ presets: ['softwares'] }]],
]

const original = fs.readFileSync(path.join(__dirname, '../test/original.txt'), 'utf-8')
const expect = fs.readFileSync(path.join(__dirname, '../test/expect.txt'), 'utf-8')

const invalids: ([string, string, number, [RuleOption]] | [string, string, number])[] = [
  ['const a="Typescript \\n Ant design"', 'const a="TypeScript \\n Ant Design"', 2],
  ['const a="Typescript"', 'const a="TypeScript"', 1],
  ['const a="Typescript and Javascript"', 'const a="TypeScript and JavaScript"', 2],
  ['const a={name:"Ant design"}', 'const a={name:"Ant Design"}', 1],
  ['const a="nintendo Switch and Javascript"', 'const a="Nintendo Swicth and JavaScript"', 2, [{ dict: { 'nintendo switch': 'Nintendo Swicth' } }]],
  ['const a="nintendo Switch and Javascript"', 'const a="Nintendo Swicth and Javascript"', 1, [{ dict: { 'nintendo switch': 'Nintendo Swicth' }, noDefault: true }]],
  ['const a="alphaGo"', 'const a="AlphaGo"', 1, [{ presets: ['brands'] }]],
]

it('runs', () => {
  const ruleTester: RuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  })

  const invalidArr = [
    {
      code: original,
      output: expect,
      errors: new Array(5).fill({ messageId: 'CasePoliceError' }),
    },
  ].concat(
    invalids.map(i => i[3]
      ? ({
          code: i[0],
          output: i[1],
          options: i[3],
          errors: Array.from({ length: i[2] }, _ => ({ messageId: 'CasePoliceError' })),
        })
      : ({
          code: i[0],
          output: i[1],
          errors: Array.from({ length: i[2] }, _ => ({ messageId: 'CasePoliceError' })),
        })),
  )

  ruleTester.run(RULE_NAME, rule, {
    valid: valids.map(i => i[1]
      ? ({
          code: i[0],
          options: i?.[1],
        })
      : ({ code: i[0] })),
    invalid: invalidArr,
  })
})
