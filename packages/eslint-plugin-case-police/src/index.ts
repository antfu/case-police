import recommended from './configs/recommended'
import stringCheck from './rule/string-check'

export default {
  rules: {
    'string-check': stringCheck,
  },
  configs: {
    recommended,
  },
}
