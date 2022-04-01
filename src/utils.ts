/* eslint-disable no-console */
import { existsSync, promises as fs } from 'fs'
import path from 'path'
import c from 'picocolors'

const DICT_FOLDER = path.resolve(import.meta.url.slice(5), '..', '../dict')

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
    // TODO throw a warning
  }

  return result
}

export async function loadAllPresets() {
  let result = {}
  const resolvers = await fs.readdir(DICT_FOLDER).then(dir =>
    dir.map(async(file) => {
      const preset = await resolvePreset(file.split('.')[0])
      result = {
        ...result,
        ...preset,
      }
    }),
  )

  await Promise.all(resolvers)

  return result
}
