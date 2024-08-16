import type { Buffer } from 'node:buffer'

declare module 'parse-gitignore' {
  interface Section {
    comment?: string
    patterns?: string[]
  }

  interface ParsedResult {
    patterns: string[]
    sections: Section[]
    path?: string
    input: Buffer
  }

  interface ParseOptions {
    path?: string
    dedupe?: boolean
    unique?: boolean
    ignore?: string[]
    unignore?: string[]
    formatSection?: (section?: Section) => string
  }

  declare function parseGitignore(input: string, options?: ParseOptions): ParsedResult

  export = parseGitignore
}
