import { SNProtocolOperator004 } from './../../protocol/operator/004/operator_004'
import { SNProtocolOperator003 } from './../../protocol/operator/003/operator_003'
import { SNProtocolOperator002 } from '@Protocol/operator/002/operator_002'
import { SNProtocolOperator001 } from '@Protocol/operator/001/operator_001'

export type AnyOperator =
  | SNProtocolOperator001
  | SNProtocolOperator002
  | SNProtocolOperator003
  | SNProtocolOperator004
