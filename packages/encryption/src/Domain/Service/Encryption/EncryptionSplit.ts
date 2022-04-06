import {
  DecryptedPayloadInterface,
  EncryptedPayloadInterface,
  ItemsKeyInterface,
} from '@standardnotes/models'
import { SNRootKey } from '../../RootKey/RootKey'
import { ItemContentTypeUsesRootKeyEncryption } from '../../Intent/Functions'

type EncryptedOrDecryptedPayload = EncryptedPayloadInterface | DecryptedPayloadInterface

type UsesRootKeySplit<T extends EncryptedOrDecryptedPayload> = {
  items: T[]
  key: SNRootKey
}

type UsesRootKeySplitWithKeyLookup<T extends EncryptedOrDecryptedPayload> = {
  items: T[]
}

type UsesItemsKeySplitWithKeyLookup<T extends EncryptedOrDecryptedPayload> = {
  items: T[]
}

type UsesItemsKeySplit<T extends EncryptedOrDecryptedPayload> = {
  items: T[]
  key: ItemsKeyInterface
}

export type EncryptionSplit<T extends EncryptedOrDecryptedPayload> = {
  usesRootKey?: {
    items: T[]
  }
  usesItemsKey?: {
    items: T[]
  }
}

export type EncryptionSplitWithKey<T extends EncryptedOrDecryptedPayload> = {
  usesRootKey?: UsesRootKeySplit<T>
  usesRootKeyWithKeyLookup?: UsesRootKeySplitWithKeyLookup<T>
  usesItemsKey?: UsesItemsKeySplit<T>
  usesItemsKeyWithKeyLookup?: UsesItemsKeySplitWithKeyLookup<T>
}

export function createKeyLookupSplitFromSplit<T extends EncryptedOrDecryptedPayload>(
  split: EncryptionSplit<T>,
): EncryptionSplitWithKey<T> {
  const result: EncryptionSplitWithKey<T> = {}

  if (split.usesRootKey) {
    result.usesRootKeyWithKeyLookup = { items: split.usesRootKey.items }
  }

  if (split.usesItemsKey) {
    result.usesItemsKeyWithKeyLookup = { items: split.usesItemsKey.items }
  }

  return result
}

export function splitItemsByEncryptionType<T extends EncryptedOrDecryptedPayload>(
  items: T[],
): EncryptionSplit<T> {
  const usesRootKey: T[] = []
  const usesItemsKey: T[] = []

  for (const item of items) {
    if (ItemContentTypeUsesRootKeyEncryption(item.content_type)) {
      usesRootKey.push(item)
    } else {
      usesItemsKey.push(item)
    }
  }

  return {
    usesRootKey: usesRootKey.length > 0 ? { items: usesRootKey } : undefined,
    usesItemsKey: usesItemsKey.length > 0 ? { items: usesItemsKey } : undefined,
  }
}

export function findPayloadInSplit<T extends EncryptedOrDecryptedPayload>(
  uuid: string,
  split: EncryptionSplitWithKey<T>,
): T {
  const inUsesItemsKey = split.usesItemsKey?.items.find((item) => item.uuid === uuid)
  if (inUsesItemsKey) {
    return inUsesItemsKey
  }

  const inUsesRootKey = split.usesRootKey?.items.find((item) => item.uuid === uuid)
  if (inUsesRootKey) {
    return inUsesRootKey
  }

  const inUsesItemsKeyWithKeyLookup = split.usesItemsKeyWithKeyLookup?.items.find(
    (item) => item.uuid === uuid,
  )
  if (inUsesItemsKeyWithKeyLookup) {
    return inUsesItemsKeyWithKeyLookup
  }

  const inUsesRootKeyWithKeyLookup = split.usesRootKeyWithKeyLookup?.items.find(
    (item) => item.uuid === uuid,
  )
  if (inUsesRootKeyWithKeyLookup) {
    return inUsesRootKeyWithKeyLookup
  }

  throw Error('Cannot find payload in split')
}
