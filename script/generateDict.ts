import path from 'node:path'
import fs from 'fs-extra'
import { DICT_FOLDER, resolvePreset } from '../src/utils'

async function run() {
  const files = await fs.readdir(DICT_FOLDER)
  const presets = files.map(file => path.parse(file).name)

  const dictMap = Object.fromEntries(
    await Promise.all(presets.map(async (preset) => {
      const dict = await resolvePreset(preset)
      return [preset, dict]
    })),
  )

  fs.outputJsonSync('./temp/dict-temp.json', dictMap)
}

run()
