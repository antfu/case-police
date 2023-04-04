import fs from 'node:fs/promises'
import { loadAllPresets } from '../../../src/utils'

async function run() {
  const dict = await loadAllPresets()
  await fs.writeFile('./dict-temp.json', JSON.stringify(dict), 'utf-8')
}

run()
