import type { Presets } from 'case-police'

export interface RuleOption {
  dict?: Record<string, string>
  noDefault?: boolean
  presets?: Presets[]
}
