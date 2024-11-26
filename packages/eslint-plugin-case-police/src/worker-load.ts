import type { RuleOption } from './types'
import { loadDictPresets } from 'case-police'
import { runAsWorker } from 'synckit'

runAsWorker(async (options: RuleOption) => {
  const defaults = options.noDefault
    ? {}
    : await loadDictPresets(options.presets?.join(',') || '')
  return {
    ...defaults,
    ...options.dict,
  }
})
