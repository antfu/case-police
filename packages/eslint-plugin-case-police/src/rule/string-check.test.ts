import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint'
import { it } from 'vitest'
import rule, { RULE_NAME } from './string-check'

const valids = ['const a=\'Ant Design\'']
const invalids = [
  ['const a=\'Typescript\'', 'const a=\'TypeScript\''],
  ['const a=\'Typescript and Javascript\'', 'const a=\'TypeScript and JavaScript\''],
  ['const a={name:\'Ant design\'}', 'const a={name:\'Ant Design\'}'],
]

it('runs', () => {
  const ruleTester: RuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  })

  ruleTester.run(RULE_NAME, rule, {
    valid: valids,
    invalid: invalids.map(i => ({
      code: i[0],
      output: i[1],
      errors: [{ messageId: 'spellError' }],
    })),
  })
})
