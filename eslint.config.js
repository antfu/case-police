import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: ['**/fixture/**'],
    formatters: true,
  },
  {
    files: ['dict/*.json'],
    rules: {
      'jsonc/sort-keys': 'error',
    },
  },
)
