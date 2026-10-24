import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const packageDir = path.resolve(__dirname, '..')
const cli = path.join(packageDir, 'dist', 'cli.mjs')
const fixture = 'test/cli-presets.txt'

describe('cli preset selection', () => {
  it('uses only the presets requested by --presets', () => {
    const result = spawnSync(process.execPath, [cli, '--presets', 'brands', fixture], {
      cwd: packageDir,
      encoding: 'utf8',
    })

    expect(result.error).toBeUndefined()
    expect(result.stdout).toContain('1 files found')
    expect(result.status).toBe(0)
  })
})
