import type { ESLint, Linter } from 'eslint'
import { version } from '../package.json'
import recommendedConfig from './configs/recommended'
import stringCheck from './rule/string-check'

const plugin = {
  meta: {
    name: 'case-police',
    version,
  },
  rules: {
    'string-check': stringCheck,
  },
  configs: {
    // @ts-expect-error TS is complaining about `value` not being the correct type but it is
    recommended: recommendedConfig,
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

export type asd = keyof RuleDefinitions
