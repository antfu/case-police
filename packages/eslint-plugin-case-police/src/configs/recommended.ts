import pluginCasePolice from '../index'

export default [
  {
    name: 'case-police/setup',
    plugins: {
      get 'case-police'(): any {
        return pluginCasePolice
      },
    },
  },
  {
    name: 'case-police/rules',
    files: ['**/*.?([cm])[jt]s?(x)'],
    rules: {
      'case-police/string-check': 'warn',
    },
  },
]
