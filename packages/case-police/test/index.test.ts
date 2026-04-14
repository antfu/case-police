import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { replace, resolvePreset } from '../src/utils'

/** @case-police-ignore */

describe('should', () => {
  it('works', async () => {
    const replaced = await replace(
      `
Github GitHub github GITHUB
vscode VScode VS Code VSCODE vs code VS code
nextjs Nextjs NextJS Next.js
`,
      '',
    )

    expect(replaced).toMatchInlineSnapshot(`
  "
  GitHub GitHub github GITHUB
  vscode VS Code VS Code VSCODE vs code VS Code
  nextjs Next.js Next.js Next.js
  "
`)
  })
})

describe('presets', () => {
  it('works', async () => {
    const applePreset = await resolvePreset('softwares')

    const replaced = await replace(
      `
      macOs Macbook
    `,
      '',
      applePreset,
    )

    expect(replaced).toBe(`
      macOS Macbook
    `)
  })
})

describe('longest-match wins', () => {
  it('prefers a longer dictionary key over a shorter prefix regardless of insertion order', async () => {
    const dict = {
      'abc': 'Abc',
      'abc.def': 'Abc.Def',
    }
    const replaced = await replace('AbC AbC.DeF', '', dict)
    expect(replaced).toBe('Abc Abc.Def')
  })

  it('same result when the shorter key comes first in the dictionary', async () => {
    const dict = {
      'abc.def': 'Abc.Def',
      'abc': 'Abc',
    }
    const replaced = await replace('AbC AbC.DeF', '', dict)
    expect(replaced).toBe('Abc Abc.Def')
  })
})

describe('utf8', async () => {
  let preset = {}
  const presetFilePath = path.join(__dirname, './dict/utf8.json')
  if (existsSync(presetFilePath)) {
    const content = await fs.readFile(presetFilePath, 'utf-8')
    preset = { ...JSON.parse(content) }
  }

  it('works', async () => {
    const replaced = await replace(
      `
      Romania romania
      Domâ Dom âDom ĕDomĕ
    `,
      '',
      preset,
    )

    expect(replaced).toMatchInlineSnapshot(`
      "
            România romania
            Domâ DOM âDom ĕDomĕ
          "
    `)
  })
})
