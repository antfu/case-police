import fg from 'fast-glob'
import { describe, expect, it } from 'vitest'
import { loadAllPresets, resolvePreset } from '../src/utils'

describe('duplicate', () => {
  it('detection', async () => {
    const names = (await fg('dict/*.json')).map(name => name.replace('dict/', '').replace('.json', ''))
    const presets = await Promise.all(names.map(async name => ({
      name,
      preset: await resolvePreset(name) as Record<string, string>,
    })))

    const allPresets = await loadAllPresets()

    const duplicates: any[] = []

    Object.keys(allPresets).forEach((value) => {
      const matched = presets.filter(preset => preset.preset[value])
      if (matched.length > 1) {
        duplicates.push({
          value,
          matched: matched.map(p => p.name),
        })
      }
    })

    expect(duplicates).toEqual([])
  })
})
