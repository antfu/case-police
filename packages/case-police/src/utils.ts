/* eslint-disable no-console */
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import c from 'picocolors'
import { dictDir } from './dirs'

export type Presets = 'softwares' | 'products' | 'general' | 'brands' | 'abbreviates'

export const DICT_FOLDER = dictDir

export const IGNORE_KEY = '@case-police-ignore'
export const DISABLE_KEY = '@case-police-disable'

export const IGNORE_REGEX = /@case-police-ignore\s+(.*)/g

export const UTF8_RANGE = '[\u0080-\uFFFF]'

export function buildRegex(dictionary: Record<string, string>): RegExp {
  const keys = Object.keys(dictionary)
  const regex = new RegExp(`\\b(${keys.join('|').replace(/\+/g, '\\+')})\\b`, 'gi')
  return regex
}

export function replaceCore(
  code: string,
  dict: Record<string, string>,
  ignore: string[] = [],
  output?: (code: string, index: number, from: string, to: string) => void,
  regex?: RegExp,
) {
  regex = regex || buildRegex(dict)
  Array.from(code.matchAll(IGNORE_REGEX)).forEach((match) => {
    const key = match[1].trim().replace(/\s*-->$/, '') // remove comment end
    ignore.push(...key.split(',').map(k => k.trim().toLowerCase()).filter(Boolean))
  })

  let changed = false
  code = code.replace(regex, (_, from: string, index: number) => {
    if (containsUTF8(code, from, index))
      return _

    if (!from.match(/[A-Z]/) || !from.match(/[a-z]/))
      return _
    const lower = from.toLowerCase()
    if (ignore.includes(lower))
      return _
    const to = dict[lower]
    if (!to || to === from)
      return _
    changed = true
    output?.(code, index, from, to)
    return to
  })
  if (changed)
    return code
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

  const output = (code: string, offset: number, original: string, replaced: string) => {
    const lines = code.slice(0, offset).split('\n')
    const line = lines.length
    const col = (lines[line - 1].length || 0) + 1
    console.log(`${c.yellow(original)} ${c.dim('→')} ${c.green(replaced)} \t ${c.dim(`./${id}:${line}:${col}`)}`)
  }

  return replaceCore(
    code,
    dict,
    ignore,
    output,
    regex,
  )
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
  // eslint-disable-next-line regexp/no-obscure-range
  const utf8Regex = new RegExp(`${UTF8_RANGE}`)
  const head = code.charAt(index - 1)
  const tail = code.charAt(index + key.length)
  return utf8Regex.test(head) || utf8Regex.test(tail)
}

export async function loadDictPresets(preset: string) {
  const presets: string[] = (preset || '')
    .split(',')
    .map((i: string) => i.trim())
    .filter(Boolean)

  let dictionary = {}

  if (presets.length) {
    Object.assign(
      dictionary,
      ...await Promise.all(presets.map(resolvePreset)),
    )
  }
  else {
    dictionary = await loadAllPresets()
  }

  return dictionary
}
