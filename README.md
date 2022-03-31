# CasePolice

[![NPM version](https://img.shields.io/npm/v/case-police?color=a1b858&label=)](https://www.npmjs.com/package/case-police)

<!-- @case-police-ignore -->

- Git**H**ub, not *Github*
- Type**S**cript, not *Typescript*
- **m**acOS, not *MacOS*
- **VS C**ode, not *Vscode*
- [...](./dict.json)

Make the case correct, PLEASE!

## Usage

**Make sure you have committed all unsaved works**, and then

```bash
npx case-police --fix
```

It will scan all your source files and fix the cases of [known names](./dict.json).

Only the word including both uppercase and lowercase will be fixed. (e.g. `Github` -> `GitHub`; `github` and `GITHUB` will be left untouched).

## Options

|Options||
|---|---|
|-d, --dict \<path\> | path to custom dict file, merge with origin dict|

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
