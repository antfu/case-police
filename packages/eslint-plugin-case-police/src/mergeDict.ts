import orginDict from '../../../temp/dict-temp.json'
export type Presets = 'softwares' | 'products' | 'general' | 'brands' | 'abbreviates'

export interface Option {
  dict?: Record<string, string>
  noDefault?: boolean
  presets?: Presets[]
}
export function mergeDict(options: Option) {
  const dictionary = {}

  if (options.presets?.length) {
    Object.assign(
      dictionary,
      ...options.presets.map(preset => (orginDict?.[preset]) ?? {}),
    )
  }
  else {
    Object.assign(
      dictionary,
      ...Object.values(orginDict),
    )
  }
  const dict = options.noDefault ? {} : dictionary

  return {
    ...dict,
    ...options.dict,
  }
}
