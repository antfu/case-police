import fs from 'node:fs/promises'
import path from 'node:path'
import { DICT_FOLDER, resolvePreset } from '../../../src/utils'

async function run() {
  const files = await fs.readdir(DICT_FOLDER)
  const presets = files.map(file => path.parse(file).name)

  const dictMap = Object.fromEntries(
    await Promise.all(presets.map(async (preset) => {
      const dict = await resolvePreset(preset)
      return [preset, dict]
    })),
  )

  await fs.writeFile('./dict-temp.json', JSON.stringify(dictMap), 'utf-8')
}

run()
