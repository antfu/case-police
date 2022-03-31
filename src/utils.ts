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
    console.log(`${c.dim(`${id}:${index}`)} \t${c.yellow(key)} -> ${c.green(value)}`)
    return value
  })
  if (changed)
    return code
}
