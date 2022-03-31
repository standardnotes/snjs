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
  PayloadSource,
  PurePayload,
  CreateMaxPayloadFromAnyObject,
  CreateSourcedPayloadFromObject,
  PayloadFormat,
} from '@standardnotes/payloads'
import { ClientDisplayableError } from '@standardnotes/responses'
import { CreateAnyKeyParams } from '../RootKey/KeyParams'
import { CreateItemFromPayload, ItemsKeyInterface } from '@standardnotes/models'
import { SNRootKeyParams } from '../RootKey/RootKeyParams'
import { SNRootKey } from '../RootKey/RootKey'
import { ContentTypeUsesRootKeyEncryption } from '../Intent/Functions'
import { isItemsKey } from '../ItemsKey'

export async function decryptBackupFile(
  file: BackupFile,
  protocolService: EncryptionService,
  password?: string,
) {
  const payloads = file.items.map((rawItem) => {
    return CreateSourcedPayloadFromObject(rawItem, PayloadSource.FileImport)
  })
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
        payloads,
        protocolService,
      )
    }
    case BackupFileType.EncryptedWithNonEncryptedItemsKey:
      return decryptEncryptedWithNonEncryptedItemsKey(payloads, protocolService)
    case BackupFileType.FullyDecrypted:
      return payloads
  }
}

function getBackupFileType(file: BackupFile, payloads: PurePayload[]): BackupFileType {
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
  payloads: PurePayload[],
  protocolService: EncryptionService,
): Promise<PurePayload[]> {
  const itemsKeys = payloads
    .filter((payload) => {
      return payload.content_type === ContentType.ItemsKey
    })
    .map((p) => CreateItemFromPayload<ItemsKeyInterface>(p))
  return decryptWithItemsKeys(payloads, itemsKeys, protocolService)
}

function findKeyToUseForPayload(
  payload: PurePayload,
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
  payloads: PurePayload[],
  itemsKeys: ItemsKeyInterface[],
  protocolService: EncryptionService,
  keyParams?: SNRootKeyParams,
  fallbackRootKey?: SNRootKey,
): Promise<PurePayload[]> {
  const decryptedPayloads: PurePayload[] = []

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
          CreateMaxPayloadFromAnyObject(encryptedPayload, {
            errorDecrypting: true,
            errorDecryptingValueChanged: !encryptedPayload.errorDecrypting,
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
        CreateMaxPayloadFromAnyObject(encryptedPayload, {
          errorDecrypting: true,
          errorDecryptingValueChanged: !encryptedPayload.errorDecrypting,
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
  payloads: PurePayload[],
  protocolService: EncryptionService,
): Promise<PurePayload[]> {
  const rootKey = await protocolService.computeRootKey(password, keyParams)

  const itemsKeysPayloads = payloads.filter((payload) => {
    return payload.content_type === ContentType.ItemsKey
  })

  const decryptedItemsKeysPayloads = await protocolService.decryptSplit({
    usesRootKey: {
      items: itemsKeysPayloads,
      key: rootKey,
    },
  })

  const results: PurePayload[] = []
  extendArray(results, decryptedItemsKeysPayloads)

  const decryptedPayloads = await decryptWithItemsKeys(
    payloads,
    decryptedItemsKeysPayloads.map((p) => CreateItemFromPayload(p)),
    protocolService,
    keyParams,
    rootKey,
  )
  extendArray(results, decryptedPayloads)

  return results
}
