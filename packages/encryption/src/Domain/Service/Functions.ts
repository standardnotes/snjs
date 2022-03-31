import { PayloadFormat } from '@standardnotes/payloads'
import { SNRootKey } from '../RootKey/RootKey'
import { SNItemsKey } from '@standardnotes/models'
import { EncryptionIntent } from '../Intent/EncryptionIntent'

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
