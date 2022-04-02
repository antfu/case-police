/* eslint-disable no-console */
import { existsSync, promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import c from 'picocolors'

const DICT_FOLDER = path.resolve(fileURLToPath(import.meta.url), '../../dict')

export const IGNORE_KEY = '@case-police-ignore'

export function buildRegex(dictionary: Record<string, string>): RegExp {
  const keys = Object.keys(dictionary)
  const regex = new RegExp(`\\b(${keys.join('|')})\\b`, 'gi')
  return regex
}

export async function replace(
  code: string,
  id: string,
  _dict?: Record<string, string>,
  regex?: RegExp,
  disabled: string[] = [],
): Promise<string | undefined> {
  const dict = _dict || await loadAllPresets()
  if (code.includes(IGNORE_KEY))
    return
  regex = regex || buildRegex(dict)
  let changed = false
  code = code.replace(regex, (_, key: string, index: number) => {
    if (!key.match(/[A-Z]/) || !key.match(/[a-z]/))
      return _
    const lower = key.toLowerCase()
    if (disabled.includes(lower))
      return _
    const value = dict[lower]
    if (!value || value === key)
      return _
    changed = true
    const lines = code.slice(0, index).split('\n')
    const line = code.slice(0, index).split('\n').length
    const col = (lines[lines.length - 1].length || 0) + 1
    console.log(`${c.yellow(key)} ${c.dim('→')} ${c.green(value)} \t ${c.dim(`./${id}:${line}:${col}`)}`)
    return value
  })
  if (changed)
    return code
}

export async function resolvePreset(preset: string) {
  let result = {}
  const file = `${preset}.json`
  const p = path.join(DICT_FOLDER, file)

  if (existsSync(p)) {
    const content = await fs.readFile(p, 'utf-8')
    result = {
      ...result,
      ...JSON.parse(content),
    }
  }
  else {
    throw new Error(`Preset "${preset}" not found`)
  }

  return result
}

export async function loadAllPresets() {
  const files = await fs.readdir(DICT_FOLDER)
  return Object.assign(
    {},
    ...await Promise.all(files.map(file => resolvePreset(file.split('.')[0]))),
  )
}
