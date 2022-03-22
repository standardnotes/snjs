import { AnyOperator } from './Types'
import { AsynchronousOperator, SynchronousOperator } from './../../protocol/operator/operator'
import { ProtocolVersion } from '@standardnotes/common'
import { SNProtocolOperator001 } from './../../protocol/operator/001/operator_001'
import { SNProtocolOperator002 } from '@Protocol/operator/002/operator_002'
import { SNProtocolOperator003 } from './../../protocol/operator/003/operator_003'
import { SNProtocolOperator004 } from './../../protocol/operator/004/operator_004'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'

export function createOperatorForVersion(
  version: ProtocolVersion,
  crypto: SNPureCrypto,
): AnyOperator {
  if (version === ProtocolVersion.V001) {
    return new SNProtocolOperator001(crypto)
  } else if (version === ProtocolVersion.V002) {
    return new SNProtocolOperator002(crypto)
  } else if (version === ProtocolVersion.V003) {
    return new SNProtocolOperator003(crypto)
  } else if (version === ProtocolVersion.V004) {
    return new SNProtocolOperator004(crypto)
  } else {
    throw Error(`Unable to find operator for version ${version}`)
  }
}

export function isAsyncOperator(
  operator: AsynchronousOperator | SynchronousOperator,
): operator is AsynchronousOperator {
  return (operator as AsynchronousOperator).generateDecryptedParametersAsync !== undefined
}
