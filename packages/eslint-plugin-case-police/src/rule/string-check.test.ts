import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import fs from 'node:fs'
import path from 'node:path'
import tsPaser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'
import * as eslintMdx from 'eslint-mdx'
import { run } from 'eslint-vitest-rule-tester'
import { assert, describe, it } from 'vitest'
import rule from './string-check'

const valids: ValidTestCase[] = [
  'const a="Ant Design"',
  { code: 'const a="iOc"', options: [{ presets: ['softwares'] }] },
]

const invalids: InvalidTestCase[] = [
  { code: 'const a="Typescript \\n Ant design"', output: 'const a="TypeScript \\n Ant Design"', errors: 2 },
  { code: 'const a="Typescript"', output: 'const a="TypeScript"', errors: 1 },
  { code: 'const a="Typescript and Javascript"', output: 'const a="TypeScript and JavaScript"', errors: 2 },
  { code: 'const a={name:"Ant design"}', output: 'const a={name:"Ant Design"}', errors: 1 },
  { code: 'const a="nintendo Switch and Javascript"', output: 'const a="Nintendo Switch and JavaScript"', errors: 2, options: [{ dict: { 'nintendo switch': 'Nintendo Switch' } }] },
  { code: 'const a="nintendo Switch and Javascript"', output: 'const a="Nintendo Switch and Javascript"', errors: 1, options: [{ dict: { 'nintendo switch': 'Nintendo Switch' }, noDefault: true }] },
  { code: 'const a="alphaGo"', output: 'const a="AlphaGo"', errors: 1, options: [{ presets: ['brands'] }] },
]

run({
  name: 'string-check',
  rule,
  invalid: [
    {
      code: fs.readFileSync(path.join(__dirname, '../test/original.txt'), 'utf-8'),
      output: fs.readFileSync(path.join(__dirname, '../test/expect.txt'), 'utf-8'),
    },
    ...invalids,
  ],
  valid: valids,
  languageOptions: {
    parser: tsPaser,
  },
})

const ruleTester = new RuleTester({
  files: ['**/*.{md,mdx}'],
  languageOptions: {
    parser: eslintMdx,
  },
})

describe('string-check (Markdown)', () => {
  it('invalid: should not throw', () => {
    assert.doesNotThrow(() => {
      ruleTester.run('string-check (Markdown)', rule, {
        valid: [],
        invalid: [
          {
            filename: '../test/original.md',
            code: fs.readFileSync(
              path.join(__dirname, '../test/original.md'),
              'utf8',
            ),
            output: fs.readFileSync(
              path.join(__dirname, '../test/expect.md'),
              'utf8',
            ),
            errors: [
              {
                messageId: 'CasePoliceError',
                line: 1,
                column: 4,
              },
              {
                messageId: 'CasePoliceError',
                line: 3,
                column: 1,
              },
              {
                messageId: 'CasePoliceError',
                line: 3,
                column: 16,
              },
            ],
          },
        ],
      })
    })
  })
})
