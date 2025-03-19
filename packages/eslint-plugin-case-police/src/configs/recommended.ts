import pluginCasePolice from '../index'

export default {
  name: 'case-police',
  files: ['**/*.?([cm])[jt]s?(x)'],
  plugins: {
    get 'case-police'(): any {
      return pluginCasePolice
    },
  },
  rules: {
    'case-police/string-check': 'warn',
  },
}
