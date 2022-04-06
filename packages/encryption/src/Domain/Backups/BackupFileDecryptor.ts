import {
  AnyKeyParamsContent,
  ContentType,
  ProtocolVersion,
  leftVersionGreaterThanOrEqualToRight,
  compareVersions,
} from '@standardnotes/common'
import { BackupFile, BackupFileType } from './BackupFile'
import { extendArray } from '@standardnotes/utils'
import { EncryptionService } from '../Service/Encryption/EncryptionService'
import {
  PayloadFormat,
  PayloadInterface,
  DecryptedPayloadInterface,
  ItemsKeyContent,
  EncryptedPayloadInterface,
  isEncryptedPayload,
  isDecryptedPayload,
  isEncryptedTransferPayload,
  EncryptedPayload,
  DecryptedPayload,
  isDecryptedTransferPayload,
  CreateDecryptedItemFromPayload,
  ItemsKeyInterface,
} from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import { CreateAnyKeyParams } from '../RootKey/KeyParams'
import { SNRootKeyParams } from '../RootKey/RootKeyParams'
import { SNRootKey } from '../RootKey/RootKey'
import { ContentTypeUsesRootKeyEncryption } from '../Intent/Functions'
import { isItemsKey, SNItemsKey } from '../ItemsKey'

export async function decryptBackupFile(
  file: BackupFile,
  protocolService: EncryptionService,
  password?: string,
) {
  const payloads: (EncryptedPayloadInterface | DecryptedPayloadInterface)[] = file.items.map(
    (item) => {
      if (isEncryptedTransferPayload(item)) {
        return new EncryptedPayload(item)
      } else if (isDecryptedTransferPayload(item)) {
        return new DecryptedPayload(item)
      }
      throw Error('Unhandled case in decryptBackupFile')
    },
  )
  const encrypted = payloads.filter(isEncryptedPayload)
  const type = getBackupFileType(file, payloads)

  switch (type) {
    case BackupFileType.Corrupt:
      return new ClientDisplayableError('Invalid backup file.')
    case BackupFileType.Encrypted: {
      if (!password) {
        throw Error('Attempting to decrypt encrypted file with no password')
      }
      const keyParamsData = (file.keyParams || file.auth_params) as AnyKeyParamsContent
      return decryptEncrypted(
        password,
        CreateAnyKeyParams(keyParamsData),
        encrypted,
        protocolService,
      )
    }
    case BackupFileType.EncryptedWithNonEncryptedItemsKey:
      return decryptEncryptedWithNonEncryptedItemsKey(payloads, protocolService)
    case BackupFileType.FullyDecrypted:
      return payloads
  }
}

function getBackupFileType(file: BackupFile, payloads: PayloadInterface[]): BackupFileType {
  if (file.keyParams || file.auth_params) {
    return BackupFileType.Encrypted
  } else {
    const hasEncryptedItem = payloads.find(
      (payload) => payload.format === PayloadFormat.EncryptedString,
    )
    const hasDecryptedItemsKey = payloads.find(
      (payload) =>
        payload.content_type === ContentType.ItemsKey &&
        payload.format === PayloadFormat.DecryptedBareObject,
    )

    if (hasEncryptedItem && hasDecryptedItemsKey) {
      return BackupFileType.EncryptedWithNonEncryptedItemsKey
    } else if (!hasEncryptedItem) {
      return BackupFileType.FullyDecrypted
    } else {
      return BackupFileType.Corrupt
    }
  }
}

async function decryptEncryptedWithNonEncryptedItemsKey(
  allPayloads: (EncryptedPayloadInterface | DecryptedPayloadInterface)[],
  protocolService: EncryptionService,
): Promise<PayloadInterface[]> {
  const decryptedItemsKeys: DecryptedPayloadInterface<ItemsKeyContent>[] = []
  const encryptedPayloads: EncryptedPayloadInterface[] = []

  allPayloads.forEach((payload) => {
    if (payload.content_type === ContentType.ItemsKey && isDecryptedPayload(payload)) {
      decryptedItemsKeys.push(payload as DecryptedPayloadInterface<ItemsKeyContent>)
    } else if (isEncryptedPayload(payload)) {
      encryptedPayloads.push(payload)
    }
  })

  const itemsKeys = decryptedItemsKeys.map((p) =>
    CreateDecryptedItemFromPayload<ItemsKeyContent, SNItemsKey>(p),
  )

  return decryptWithItemsKeys(encryptedPayloads, itemsKeys, protocolService)
}

function findKeyToUseForPayload(
  payload: EncryptedPayloadInterface,
  availableKeys: ItemsKeyInterface[],
  protocolService: EncryptionService,
  keyParams?: SNRootKeyParams,
  fallbackRootKey?: SNRootKey,
): ItemsKeyInterface | SNRootKey | undefined {
  let itemsKey: ItemsKeyInterface | SNRootKey | undefined

  if (payload.items_key_id) {
    itemsKey = protocolService.itemsKeyForPayload(payload)
    if (itemsKey) {
      return itemsKey
    }
  }

  itemsKey = availableKeys.find((itemsKeyPayload) => {
    return payload.items_key_id === itemsKeyPayload.uuid
  })

  if (itemsKey) {
    return itemsKey
  }

  if (!keyParams) {
    return undefined
  }

  const payloadVersion = payload.version as ProtocolVersion

  /**
   * Payloads with versions <= 003 use root key directly for encryption.
   * However, if the incoming key params are >= 004, this means we should
   * have an items key based off the 003 root key. We can't use the 004
   * root key directly because it's missing dataAuthenticationKey.
   */
  if (leftVersionGreaterThanOrEqualToRight(keyParams.version, ProtocolVersion.V004)) {
    itemsKey = protocolService.defaultItemsKeyForItemVersion(payloadVersion, availableKeys)
  } else if (compareVersions(payloadVersion, ProtocolVersion.V003) <= 0) {
    itemsKey = fallbackRootKey
  }

  return itemsKey
}

async function decryptWithItemsKeys(
  payloads: EncryptedPayloadInterface[],
  itemsKeys: ItemsKeyInterface[],
  protocolService: EncryptionService,
  keyParams?: SNRootKeyParams,
  fallbackRootKey?: SNRootKey,
): Promise<PayloadInterface[]> {
  const decryptedPayloads: (DecryptedPayloadInterface | EncryptedPayloadInterface)[] = []

  for (const encryptedPayload of payloads) {
    if (ContentTypeUsesRootKeyEncryption(encryptedPayload.content_type)) {
      continue
    }

    try {
      const key = findKeyToUseForPayload(
        encryptedPayload,
        itemsKeys,
        protocolService,
        keyParams,
        fallbackRootKey,
      )

      if (!key) {
        decryptedPayloads.push(
          encryptedPayload.copy({
            errorDecrypting: true,
          }),
        )
        continue
      }

      if (isItemsKey(key)) {
        const decryptedPayload = await protocolService.decryptSplitSingle({
          usesItemsKey: {
            items: [encryptedPayload],
            key: key,
          },
        })
        decryptedPayloads.push(decryptedPayload)
      } else {
        const decryptedPayload = await protocolService.decryptSplitSingle({
          usesRootKey: {
            items: [encryptedPayload],
            key: key,
          },
        })
        decryptedPayloads.push(decryptedPayload)
      }
    } catch (e) {
      decryptedPayloads.push(
        encryptedPayload.copy({
          errorDecrypting: true,
        }),
      )
      console.error('Error decrypting payload', encryptedPayload, e)
    }
  }

  return decryptedPayloads
}

async function decryptEncrypted(
  password: string,
  keyParams: SNRootKeyParams,
  payloads: EncryptedPayloadInterface[],
  protocolService: EncryptionService,
): Promise<(EncryptedPayloadInterface | DecryptedPayloadInterface)[]> {
  const rootKey = await protocolService.computeRootKey(password, keyParams)

  const itemsKeysPayloads = payloads.filter((payload) => {
    return payload.content_type === ContentType.ItemsKey
  })

  const decryptedItemsKeysPayloads = (
    await protocolService.decryptSplit({
      usesRootKey: {
        items: itemsKeysPayloads,
        key: rootKey,
      },
    })
  ).filter(isDecryptedPayload)

  const results: (EncryptedPayloadInterface | DecryptedPayloadInterface)[] = []
  extendArray(results, decryptedItemsKeysPayloads)

  const decryptedPayloads = await decryptWithItemsKeys(
    payloads,
    decryptedItemsKeysPayloads.map((p) => CreateDecryptedItemFromPayload(p)),
    protocolService,
    keyParams,
    rootKey,
  )
  extendArray(results, decryptedPayloads)

  return results
}
