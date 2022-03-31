/* eslint-disable no-console */
import { existsSync, promises as fs } from 'fs'
import fg from 'fast-glob'
import c from 'picocolors'
import parseIgnore from 'parse-gitignore'
import isText from 'is-text-path'
import pLimit from 'p-limit'
import minimist from 'minimist'
import dictionary from '../dict.json'
import { version } from '../package.json'
import { buildRegex, replace } from './utils'

async function run() {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['fix', 'no-default'],
    string: ['dict', 'disable'],
    alias: {
      d: 'dict',
    },
  })

  const ignore = [
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

  let dict = argv['no-default'] ? {} : dictionary

  if (argv.dict) {
    const str = await fs.readFile(argv.dict, 'utf8')
    const userDict = JSON.parse(str)
    dict = {
      ...dict,
      ...userDict,
    }
  }

  const files = await fg('**/*.*', {
    ignore,
  }).then(files => files.filter(file => isText(file)))

  const disabled: string[] = (argv.disable ? argv.disable.split(',') : []).map((i: string) => i.trim().toLowerCase())
  const regex = buildRegex(dict)

  const limit = pLimit(5)
  console.log()
  console.log(c.inverse(c.red(' Case ')) + c.inverse(c.blue(' Police ')) + c.dim(` v${version}`))
  console.log()
  console.log(c.blue(files.length) + c.dim(' files found for checking\n'))
  const wrote: string[] = []
  await Promise.all(files.map(file => limit(async() => {
    const code = await fs.readFile(file, 'utf-8')
    const replaced = replace(code, file, dict, regex, disabled)
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
