import { runAsWorker } from 'synckit'
import { loadDictPresets } from 'case-police'
import type { RuleOption } from './types'

runAsWorker(async (options: RuleOption) => {
  const defaults = options.noDefault
    ? {}
    : await loadDictPresets(options.presets?.join(',') || '')
  return {
    ...defaults,
    ...options.dict,
  }
})
