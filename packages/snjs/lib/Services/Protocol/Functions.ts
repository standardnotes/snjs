import { ItemInterface } from './../../../../payloads/src/Domain/Item/ItemInterface'
import { PayloadFormat, PurePayload } from '@standardnotes/payloads'
import { SNItemsKey } from '@Lib/Models'
import { SNRootKey } from '@Protocol/root_key'
import { EncryptionIntent, ItemContentTypeUsesRootKeyEncryption } from '@standardnotes/applications'
import { AnyOperator } from './Types'
import { AsynchronousOperator, SynchronousOperator } from '../../Protocol/operator/operator'
import { ProtocolVersion } from '@standardnotes/common'
import { SNProtocolOperator001 } from '../../Protocol/operator/001/operator_001'
import { SNProtocolOperator002 } from '@Lib/Protocol/operator/002/operator_002'
import { SNProtocolOperator003 } from '../../Protocol/operator/003/operator_003'
import { SNProtocolOperator004 } from '../../Protocol/operator/004/operator_004'
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

/**
 * Given a key and intent, returns the proper PayloadFormat,
 * or throws an exception if unsupported configuration of parameters.
 */
export function payloadContentFormatForIntent(
  intent: EncryptionIntent,
  key?: SNRootKey | SNItemsKey,
) {
  if (!key) {
    /** Decrypted */
    if (
      intent === EncryptionIntent.LocalStorageDecrypted ||
      intent === EncryptionIntent.FileDecrypted
    ) {
      return PayloadFormat.DecryptedBareObject
    } else {
      throw 'Unhandled decrypted case in protocolService.payloadContentFormatForIntent.'
    }
  } else {
    /** Encrypted */
    if (
      intent === EncryptionIntent.Sync ||
      intent === EncryptionIntent.FileEncrypted ||
      intent === EncryptionIntent.LocalStorageEncrypted
    ) {
      return PayloadFormat.EncryptedString
    } else {
      throw 'Unhandled encrypted case in protocolService.payloadContentFormatForIntent.'
    }
  }
}

/**
 * @returns The SNItemsKey object to use to encrypt new or updated items.
 */
export function findDefaultItemsKey(itemsKeys: SNItemsKey[]): SNItemsKey | undefined {
  if (itemsKeys.length === 1) {
    return itemsKeys[0]
  }

  const defaultKeys = itemsKeys.filter((key) => {
    return key.isDefault
  })

  if (defaultKeys.length > 1) {
    /**
     * Prioritize one that is synced, as neverSynced keys will likely be deleted after
     * DownloadFirst sync.
     */
    const syncedKeys = defaultKeys.filter((key) => !key.neverSynced)
    if (syncedKeys.length > 0) {
      return syncedKeys[0]
    }
  }

  return defaultKeys[0]
}
