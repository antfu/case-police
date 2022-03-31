/* eslint-disable no-console */
import c from 'picocolors'
import dictionary from '../dict.json'

export const IGNORE_KEY = '@case-police-ignore'

export function buildRegex(dictionary: Record<string, string>): RegExp {
  const keys = Object.keys(dictionary)
  const regex = new RegExp(`\\b(${keys.join('|')})\\b`, 'gi')
  return regex
}

export function replace(
  code: string,
  id: string,
  dict: Record<string, string> = dictionary,
  regex?: RegExp,
  disabled: string[] = [],
): string | undefined {
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
