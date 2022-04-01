import { describe, expect, it } from 'vitest'
import { replace } from '../src/utils'

/** @case-police-ignore */

describe('should', () => {
  it('works', async() => {
    const replaced = await replace(
      `
Github GitHub github GITHUB
vscode VScode VS Code VSCODE vs code VS code
`,
      '',
    )

    expect(replaced).toMatchInlineSnapshot(`
  "
  GitHub GitHub github GITHUB
  vscode VS Code VS Code VSCODE vs code VS Code
  "
`)
  })
})
