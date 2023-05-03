import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export const distDir = fileURLToPath(new URL('../dist', import.meta.url))
export const dictDir = resolve(distDir, '../dict')
