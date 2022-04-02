/* eslint-disable no-console */
import { existsSync, promises as fs } from 'fs'
import fg from 'fast-glob'
import c from 'picocolors'
import parseIgnore from 'parse-gitignore'
import isText from 'is-text-path'
import pLimit from 'p-limit'
import minimist from 'minimist'
import { version } from '../package.json'
import { buildRegex, loadAllPresets, replace, resolvePreset } from './utils'

async function run() {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['fix', 'no-default'],
    string: ['dict', 'disable', 'ignore', 'presets'],
    alias: {
      d: 'dict',
      p: 'presets',
    },
  })

  // ignore
  let ignore = [
    '*.log',
    '**/dist/**',
    '**/node_modules/**',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
  ]
  if (existsSync('.gitignore')) {
    const gitignore = await fs.readFile('.gitignore', 'utf8')
    ignore.push(...parseIgnore(gitignore))
  }
  if (argv.ignore)
    ignore.push(argv.ignore.split(',').map((i: string) => i.trim()))
  ignore = ignore.filter(Boolean)

  let dictionary = {}

  // presets
  const presets: string[] = (argv.presets || '')
    .split(',')
    .map((i: string) => i.trim())
    .filter(Boolean)
  if (argv['no-default']) {
    // nothing
  }
  else if (presets.length) {
    Object.assign(
      dictionary,
      ...await Promise.all(presets.map(resolvePreset)),
    )
  }
  else {
    dictionary = await loadAllPresets()
  }

  // dict
  let dict = argv['no-default'] ? {} : dictionary
  if (argv.dict) {
    const str = await fs.readFile(argv.dict, 'utf8')
    const userDict = JSON.parse(str)
    dict = {
      ...dict,
      ...userDict,
    }
  }

  // glob
  if (!argv._.length)
    argv._.push('**/*.*')
  const files = await fg(argv._, { ignore })
    .then(files => files.filter(file => isText(file)))

  // check
  const disabled: string[] = (argv.disable ? argv.disable.split(',') : []).map((i: string) => i.trim().toLowerCase())
  const regex = buildRegex(dict)

  const limit = pLimit(5)
  console.log()
  console.log(c.inverse(c.red(' Case ')) + c.inverse(c.blue(' Police ')) + c.dim(` v${version}`))
  console.log()
  console.log(c.blue(files.length) + c.dim(' files found for checking, ') + c.cyan(Object.keys(dictionary).length) + c.dim(' words loaded\n'))
  const wrote: string[] = []
  await Promise.all(files.map(file => limit(async() => {
    const code = await fs.readFile(file, 'utf-8')
    const replaced = await replace(code, file, dict, regex, disabled)
    if (replaced) {
      wrote.push(file)
      if (argv.fix)
        await fs.writeFile(file, replaced, 'utf-8')
    }
  })))

  if (!wrote.length) {
    console.log(c.green('All good, well done!'))
  }
  else {
    if (argv.fix) {
      console.log(c.green('\nfiles fixed'))
    }
    else {
      console.log(c.dim(`\n${wrote.length} files contain case errors`))
      console.log(c.dim('run ') + c.magenta(c.bold('npx case-police --fix')) + c.dim(' to fix\n'))
      process.exitCode = 1
    }
  }
}

run()
