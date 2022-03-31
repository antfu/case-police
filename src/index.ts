/* eslint-disable no-console */
import { existsSync, promises as fs } from 'fs'
import fg from 'fast-glob'
import c from 'picocolors'
import parseIgnore from 'parse-gitignore'
import isText from 'is-text-path'
import pLimit from 'p-limit'
import minimist from 'minimist'
import defaultDictionary from '../dict.json'
import { buildRegex, replace } from './utils'

async function run() {
  const argv = minimist(process.argv.slice(2), {
    boolean: ['fix'],
    string: ['append', 'd', 'dict'],
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

  let dictionary = { ...defaultDictionary }
  if (argv.append && existsSync(argv.append)) {
    const appendDictionary = JSON.parse(await fs.readFile(argv.append, 'utf8'))
    dictionary = { ...dictionary, ...appendDictionary }
  }
  else if (argv.append) { console.log(c.red('An --append option was provided but the file does not exist\n')) }

  const files = await fg('**/*.*', {
    ignore,
  }).then(files => files.filter(file => isText(file)))

  const regex = buildRegex(dictionary)

  const limit = pLimit(5)
  console.log()
  console.log(c.inverse(c.red('C')) + c.blue(c.underline('ase')) + c.inverse(c.red('P')) + c.blue(c.underline('olice')))
  console.log()
  console.log(c.dim('checking ') + c.yellow(files.length) + c.dim(' files\n'))
  const wrote: string[] = []
  await Promise.all(files.map(file => limit(async() => {
    const code = await fs.readFile(file, 'utf-8')
    const replaced = replace(code, file, dictionary, regex)
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
    if (argv.fix)
      console.log(c.green('\nfiles fixed:'))
    else
      console.log(c.yellow('\nfiles needs to be fixed:'))
    console.log(c.dim(wrote.map(i => ` - ${i}`).join('\n')))

    if (!argv.fix) {
      console.log(c.dim('\nrun ') + c.magenta(c.bold('npx case-police --fix')) + c.dim(' to fix\n'))
      process.exitCode = 1
    }
  }
}

run()
