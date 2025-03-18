import type { ESLint, Linter } from 'eslint'
import { version } from '../package.json'
import stringCheck from './rule/string-check'

const plugin = {
  meta: {
    name: 'case-police',
    version,
  },
  rules: {
    'string-check': stringCheck,
  },
} satisfies ESLint.Plugin

export default plugin

type RuleDefinitions = typeof plugin['rules']

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]['defaultOptions']
}

export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>
}
