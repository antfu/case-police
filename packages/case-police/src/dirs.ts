import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const distDir = fileURLToPath(new URL('../dist', import.meta.url))
export const dictDir = resolve(distDir, '../dict')
