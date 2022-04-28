import { AllKeyParamsContents } from './KeyParams'

export const ValidKeyParamsKeys: (keyof AllKeyParamsContents)[] = [
  'identifier',
  'pw_cost',
  'pw_nonce',
  'pw_salt',
  'version',
  'origination',
  'created',
]
