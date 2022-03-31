# CasePolice

[![NPM version](https://img.shields.io/npm/v/case-police?color=a1b858&label=)](https://www.npmjs.com/package/case-police)

<!-- @case-police-ignore -->

- Type**S**cript, not *Typescript*
- Git**H**ub, not *Github*
- VS Code, not *Vscode*
- ...

Make the case correct, PLEASE!

## Usage

**Make sure you have committed all unsaved works**, and then

```bash
npx case-police --fix
```

It will scan all your source files and fix the cases of [known names](./dict.json).

Only the word including both uppercase and lowercase will be fixed. (e.g. `Github` -> `GitHub`; `github` and `GITHUB` will be left untouched).

### Using in CI

Simply add `case-police` (without `--fix`) to your workflow and it will exit with a non-zero code for your CI to catch it.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
