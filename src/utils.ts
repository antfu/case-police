/* eslint-disable no-console */
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import c from 'picocolors'

const DICT_FOLDER = path.resolve(fileURLToPath(import.meta.url), '../../dict')

export const IGNORE_KEY = '@case-police-ignore'
export const DISABLE_KEY = '@case-police-disable'

export const IGNORE_REGEX = /@case-police-ignore\s+([^\s]+)/g

export const UTF8_RANGE = '[\u0080-\uFFFF]'

export function buildRegex(dictionary: Record<string, string>): RegExp {
  const keys = Object.keys(dictionary)
  const regex = new RegExp(`\\b(${keys.join('|').replace(/\+/g, '\\+')})\\b`, 'gi')
  return regex
}

export async function replace(
  code: string,
  id: string,
  _dict?: Record<string, string>,
  regex?: RegExp,
  _ignore: string[] = [],
): Promise<string | undefined> {
  if (code.includes(DISABLE_KEY))
    return

  const dict = _dict || await loadAllPresets()
  const ignore = _ignore.slice()

  Array.from(code.matchAll(IGNORE_REGEX)).forEach((match) => {
    const [, key] = match
    ignore.push(...key.split(',').map(k => k.trim().toLowerCase()).filter(Boolean))
  })

  regex = regex || buildRegex(dict)
  let changed = false
  code = code.replace(regex, (_, key: string, index: number) => {
    if (containsUTF8(code, key, index))
      return _

    if (!key.match(/[A-Z]/) || !key.match(/[a-z]/))
      return _
    const lower = key.toLowerCase()
    if (ignore.includes(lower))
      return _
    const value = dict[lower]
    if (!value || value === key)
      return _
    changed = true
    const lines = code.slice(0, index).split('\n')
    const line = lines.length
    const col = (lines[line - 1].length || 0) + 1
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

function containsUTF8(code: string, key: string, index: number) {
  const utf8Regex = new RegExp(`${UTF8_RANGE}`)
  const head = code.charAt(index - 1)
  const tail = code.charAt(index + key.length)
  return utf8Regex.test(head) || utf8Regex.test(tail)
}
