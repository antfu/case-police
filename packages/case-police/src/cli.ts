import { existsSync, promises as fs } from 'node:fs'
import process from 'node:process'
import c from 'ansis'
import fg from 'fast-glob'
import isText from 'is-text-path'
import minimist from 'minimist'
import pLimit from 'p-limit'
// @ts-expect-error missing types
import parseIgnore from 'parse-gitignore'
import { version } from '../package.json'
import { buildRegex, loadDictPresets, replace } from './utils'

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
    '*.min.*',
    '**/dist/**',
    '**/node_modules/**',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
  ]
  if (existsSync('.gitignore')) {
    const gitignore = await fs.readFile('.gitignore', 'utf8')
    ignore.push(...parseIgnore(gitignore).patterns)
  }
  if (argv.ignore)
    ignore.push(...argv.ignore.split(',').map((i: string) => i.trim()))
  ignore = ignore.filter(Boolean)

  let dict = {}

  // presets
  if (!argv['no-default'])
    dict = await loadDictPresets(argv.preset)

  // dict
  if (argv.dict) {
    const str = await fs.readFile(argv.dict, 'utf8')
    const userDict = JSON.parse(str)
    dict = {
      ...dict,
      ...userDict,
    }

    ignore.push(argv.dict)
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
  console.log(c.inverse.red(' Case ') + c.inverse.blue(' Police ') + c.dim` v${version}`)
  console.log()
  console.log(c.blue(files.length) + c.dim` files found for checking, ${c.cyan(Object.keys(dict).length)} words loaded\n`)
  const wrote: string[] = []
  await Promise.all(files.map(file => limit(async () => {
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
      console.log(c.dim`\n${wrote.length} files contain case errors`)
      console.log(c.dim`run ${c.magenta.bold`npx case-police --fix`} to fix\n`)
      process.exitCode = 1
    }
  }
}

run()
