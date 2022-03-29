import { ItemInterface, PurePayload } from '@standardnotes/payloads'
import { SNRootKey } from '@Lib/Protocol/root_key'
import { SNItemsKey } from '@Lib/Models'
import { ItemContentTypeUsesRootKeyEncryption } from '@standardnotes/applications'

type ItemOrPayload = ItemInterface | PurePayload

type UsesRootKeySplit<T extends ItemOrPayload> = {
  items: T[]
  key: SNRootKey
}

type UsesRootKeySplitWithKeyLookup<T extends ItemOrPayload> = {
  items: T[]
}

type UsesItemsKeySplitWithKeyLookup<T extends ItemOrPayload> = {
  items: T[]
}

type UsesItemsKeySplit<T extends ItemOrPayload> = {
  items: T[]
  key: SNItemsKey
}

export type EncryptionSplit<T extends ItemOrPayload> = {
  usesRootKey?: {
    items: T[]
  }
  usesItemsKey?: {
    items: T[]
  }
}

export type EncryptionSplitWithKey<T extends ItemOrPayload> = {
  usesRootKey?: UsesRootKeySplit<T>
  usesRootKeyWithKeyLookup?: UsesRootKeySplitWithKeyLookup<T>
  usesItemsKey?: UsesItemsKeySplit<T>
  usesItemsKeyWithKeyLookup?: UsesItemsKeySplitWithKeyLookup<T>
}

export function createKeyLookupSplitFromSplit<T extends ItemOrPayload>(
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

export function splitItemsByEncryptionType<T extends ItemOrPayload>(
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
    usesRootKey: { items: usesRootKey },
    usesItemsKey: { items: usesItemsKey },
  }
}

export function findPayloadInSplit<T extends ItemOrPayload>(
  uuid: string,
  split: EncryptionSplit<T>,
): T {
  const inUsesItemsKey = split.usesItemsKey?.items.find((item) => item.uuid === uuid)
  if (inUsesItemsKey) {
    return inUsesItemsKey
  }

  const inUsesRootKey = split.usesRootKey?.items.find((item) => item.uuid === uuid)
  if (inUsesRootKey) {
    return inUsesRootKey
  }

  throw Error('Cannot find payload in split')
}
