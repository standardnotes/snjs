import { SNProtocolOperator001 } from '../Operator/001/Operator001'
import { SNProtocolOperator002 } from '../Operator/002/Operator002'
import { SNProtocolOperator003 } from '../Operator/003/Operator003'
import { SNProtocolOperator004 } from '../Operator/004/Operator004'

export type AnyOperator =
  | SNProtocolOperator001
  | SNProtocolOperator002
  | SNProtocolOperator003
  | SNProtocolOperator004

export enum EncryptionType {
  ItemsKey = 'ItemsKey',
  RootKey = 'RootKey',
}
