import fs from 'node:fs'
import path from 'node:path'
import { run } from 'eslint-vitest-rule-tester'
import tsPaser from '@typescript-eslint/parser'
import type { RuleOption } from '../types'
import rule from './string-check'

const valids: ([string, [RuleOption]] | [string])[] = [
  ['const a="Ant Design"'],
  ['const a="iOc"', [{ presets: ['softwares'] }]],
]

const invalids: ([string, string, number, [RuleOption]] | [string, string, number])[] = [
  ['const a="Typescript \\n Ant design"', 'const a="TypeScript \\n Ant Design"', 2],
  ['const a="Typescript"', 'const a="TypeScript"', 1],
  ['const a="Typescript and Javascript"', 'const a="TypeScript and JavaScript"', 2],
  ['const a={name:"Ant design"}', 'const a={name:"Ant Design"}', 1],
  ['const a="nintendo Switch and Javascript"', 'const a="Nintendo Swicth and JavaScript"', 2, [{ dict: { 'nintendo switch': 'Nintendo Swicth' } }]],
  ['const a="nintendo Switch and Javascript"', 'const a="Nintendo Swicth and Javascript"', 1, [{ dict: { 'nintendo switch': 'Nintendo Swicth' }, noDefault: true }]],
  ['const a="alphaGo"', 'const a="AlphaGo"', 1, [{ presets: ['brands'] }]],
]

run({
  rule,
  invalid: [
    {
      code: fs.readFileSync(path.join(__dirname, '../test/original.txt'), 'utf-8'),
      output: fs.readFileSync(path.join(__dirname, '../test/expect.txt'), 'utf-8'),
    },
    ...invalids.map(i => i[3]
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
  ],
  valid: valids.map(i => i[1]
    ? ({
        code: i[0],
        options: i?.[1],
      })
    : ({ code: i[0] })),
  languageOptions: {
    parser: tsPaser,
  },
})
