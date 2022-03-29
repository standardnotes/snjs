import { SNRootKey } from './../../Protocol/root_key'
import { SNLog } from '../../log'
import { PurePayload, CreateMaxPayloadFromAnyObject, PayloadFormat } from '@standardnotes/payloads'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { isNullOrUndefined, isString } from '@standardnotes/utils'
import { isAsyncOperator } from './Functions'
import { OperatorManager } from './OperatorManager'

export async function encryptPayload(
  payload: PurePayload,
  key: SNItemsKey | SNRootKey,
  operatorManager: OperatorManager,
): Promise<PurePayload> {
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

export async function encryptPayloads(
  payloads: PurePayload[],
  key: SNItemsKey | SNRootKey,
  operatorManager: OperatorManager,
) {
  const results = []
  for (const payload of payloads) {
    const encryptedPayload = await encryptPayload(payload, key, operatorManager)
    results.push(encryptedPayload)
  }
  return results
}

/**
 * Generates a new payload by decrypting the input payload.
 * If the input payload is already decrypted, it will be returned as-is.
 * @param payload - The payload to decrypt.
 * @param key The key to use to decrypt the payload.
 * If none is supplied, it will be automatically looked up.
 */
export async function decryptPayload(
  payload: PurePayload,
  key: SNItemsKey | SNRootKey,
  operatorManager: OperatorManager,
): Promise<PurePayload> {
  if (!payload.content) {
    SNLog.error(Error('Attempting to decrypt payload that has no content.'))
    return CreateMaxPayloadFromAnyObject(payload, {
      errorDecrypting: true,
    })
  }

  const format = payload.format
  if (format === PayloadFormat.DecryptedBareObject) {
    return payload
  }

  if (key.errorDecrypting) {
    return CreateMaxPayloadFromAnyObject(payload, {
      waitingForKey: true,
      errorDecrypting: true,
    })
  }

  const operator = operatorManager.operatorForVersion(payload.version!)
  const source = payload.source
  try {
    let decryptedParameters
    if (isAsyncOperator(operator)) {
      decryptedParameters = await operator.generateDecryptedParametersAsync(payload, key)
    } else {
      decryptedParameters = operator.generateDecryptedParametersSync(payload, key) as PurePayload
    }
    return CreateMaxPayloadFromAnyObject(payload, decryptedParameters, source)
  } catch (e) {
    console.error('Error decrypting payload', payload, e)
    return CreateMaxPayloadFromAnyObject(payload, {
      errorDecrypting: true,
      errorDecryptingValueChanged: !payload.errorDecrypting,
    })
  }
}

export async function decryptPayloads(
  payloads: PurePayload[],
  key: SNItemsKey | SNRootKey,
  operatorManager: OperatorManager,
): Promise<PurePayload[]> {
  const decryptItem = (encryptedPayload: PurePayload) => {
    if (!encryptedPayload) {
      /** Keep in-counts similar to out-counts */
      return encryptedPayload
    }
    /**
     * We still want to decrypt deleted payloads if they have content in case
     * they were marked as dirty but not yet synced.
     */
    if (encryptedPayload.deleted === true && isNullOrUndefined(encryptedPayload.content)) {
      return encryptedPayload
    }
    const isDecryptable = isString(encryptedPayload.content)
    if (!isDecryptable) {
      return encryptedPayload
    }
    return decryptPayload(encryptedPayload, key, operatorManager)
  }

  return Promise.all(payloads.map((payload) => decryptItem(payload)))
}
