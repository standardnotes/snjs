import { SNProtocolOperator004 } from '../../Protocol/operator/004/operator_004'
import { SNProtocolOperator003 } from '../../Protocol/operator/003/operator_003'
import { SNProtocolOperator002 } from '@Lib/Protocol/operator/002/operator_002'
import { SNProtocolOperator001 } from '@Lib/Protocol/operator/001/operator_001'

// export type AnyOperator =
//   | SNProtocolOperator001
//   | SNProtocolOperator002
//   | SNProtocolOperator003
//   | SNProtocolOperator004

export type AnyOperator = SNProtocolOperator004

export enum EncryptionType {
  ItemsKey = 'ItemsKey',
  RootKey = 'RootKey',
}
