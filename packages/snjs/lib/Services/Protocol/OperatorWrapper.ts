import { SNRootKey } from './../../Protocol/root_key'
import {
  PurePayload,
  EncryptedParameters,
  ErroredDecryptingParameters,
  DecryptedParameters,
  encryptedParametersFromPayload,
} from '@standardnotes/payloads'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { isAsyncOperator } from './Functions'
import { OperatorManager } from './OperatorManager'

export async function encryptPayload(
  payload: PurePayload,
  key: SNItemsKey | SNRootKey,
  operatorManager: OperatorManager,
): Promise<EncryptedParameters> {
  const operator = operatorManager.operatorForVersion(key.keyVersion)
  let encryptionParameters

  if (isAsyncOperator(operator)) {
    encryptionParameters = await operator.generateEncryptedParametersAsync(payload, key)
  } else {
    encryptionParameters = operator.generateEncryptedParametersSync(payload, key)
  }

  if (!encryptionParameters) {
    throw 'Unable to generate encryption parameters'
  }

  return encryptionParameters
}

export async function decryptPayload(
  payload: PurePayload,
  key: SNItemsKey | SNRootKey,
  operatorManager: OperatorManager,
): Promise<DecryptedParameters | ErroredDecryptingParameters> {
  const operator = operatorManager.operatorForVersion(payload.version)

  try {
    if (isAsyncOperator(operator)) {
      return await operator.generateDecryptedParametersAsync(
        encryptedParametersFromPayload(payload),
        key,
      )
    } else {
      return operator.generateDecryptedParametersSync(encryptedParametersFromPayload(payload), key)
    }
  } catch (e) {
    console.error('Error decrypting payload', payload, e)
    return {
      uuid: payload.uuid,
      errorDecrypting: true,
      errorDecryptingValueChanged: !payload.errorDecrypting,
    }
  }
}
