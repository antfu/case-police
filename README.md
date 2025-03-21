# 🚨 CasePolice

[![NPM version](https://img.shields.io/npm/v/case-police?color=a1b858&label=)](https://www.npmjs.com/package/case-police)

<!-- @case-police-ignore -->

- Git**H**ub, not _Github_
- Type**S**cript, not _Typescript_
- **m**acOS, not _MacOS_
- **VS C**ode, not _Vscode_
- [...](./packages/case-police/dict)

Make the case correct, PLEASE!

## Usage

**Make sure you have committed all unsaved works**, and then

```bash
npx case-police --fix
```

It will scan all your source files and fix the cases of [known names](./packages/case-police/dict).

Only the word including both uppercase and lowercase will be fixed. (e.g. `Github` -> `GitHub`; `github` and `GITHUB` will be left untouched).

### Use in ESLint

We also provide an ESLint plugin that can be used to lint your codebase.

#### Flat Config

```bash
npm i -D eslint-plugin-case-police
```

<!-- eslint-skip -->

```js
// .eslint.config.js
import pluginCasePolice from "eslint-plugin-case-police";

export default [
  pluginCasePolice.configs.recommended,
];
```

#### Legacy

```bash
npm i -D eslint-plugin-case-police@^1.0.0
```

<!-- eslint-skip -->

```jsonc
// .eslintrc
{
  "extends": [
    "plugin:case-police/recommended"
  ]
}
```

### Use in CI

Simply add `case-police` (without `--fix`) to your workflow and it will exit with a non-zero code for your CI to catch it.

### Specific files

By default it will scan all the text files under the current directory (respects `.gitignore`), if you want it to check only specific files, you can pass the file paths of glob patterns to it.

```bash
npx case-police "**/*.md" path/to/file.html
```

## CLI Options

| Options                   | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| `[...globs]`              | Files or glob to be checked, if not provided, all the text files will be check |
| `--fix`                   | Rewrite changes to file                                                        |
| `-d, --dict <path>`       | Custom dictionary JSON, will be merged with original dict                      |
| `-p, --presets <presets>` | Filter the default [presets](./packages/case-police/dict), comma separated     |
| `--no-default`            | Disable the default dictionary                                                 |
| `--disable <rules>`       | Disable rules, comma separated                                                 |
| `--ignore <globs>`        | Files or globs to be ignore, comma separated                                   |

### Ignores

You can add `@case-police-disable` in your file to disable the case check for the particular file, or add `@case-police-ignore xxx` to ignore certain words in that file (use comma to separate mutliple words).

For example:

```ts
// @case-police-ignore Uri

console.log(something.Uri.path)
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## Related Projects

[actions-case-police](https://github.com/Namchee/actions-case-police). Use the correct letter case in GitHub issues and pull requests

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
