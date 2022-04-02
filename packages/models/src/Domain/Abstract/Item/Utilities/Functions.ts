import { omitInPlace, sortedCopy } from '@standardnotes/utils'
import { ItemInterface } from '../Interfaces/ItemInterface'
import { ItemContent } from '../Interfaces/ItemContent'
import { DefaultAppDomain } from '../Types/DefaultAppDomain'
import { AppDataField } from '../Types/AppDataField'

export function ItemContentsDiffer(
  item1: ItemInterface,
  item2: ItemInterface,
  excludeContentKeys: (keyof ItemContent)[] = [],
) {
  return !ItemContentsEqual(
    item1.content as ItemContent,
    item2.content as ItemContent,
    [...item1.contentKeysToIgnoreWhenCheckingEquality(), ...excludeContentKeys],
    item1.appDataContentKeysToIgnoreWhenCheckingEquality(),
  )
}
export function ItemContentsEqual<C extends ItemContent = ItemContent>(
  leftContent: C,
  rightContent: C,
  keysToIgnore: (keyof C)[],
  appDataKeysToIgnore: AppDataField[],
) {
  /* Create copies of objects before running omit as not to modify source values directly. */
  const leftContentCopy: Partial<C> = sortedCopy(leftContent)
  if (leftContentCopy.appData) {
    const domainData = leftContentCopy.appData[DefaultAppDomain]
    omitInPlace(domainData, appDataKeysToIgnore)
    /**
     * We don't want to disqualify comparison if one object contains an empty domain object
     * and the other doesn't contain a domain object. This can happen if you create an item
     * without setting dirty, which means it won't be initialized with a client_updated_at
     */
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete leftContentCopy.appData
      }
    } else {
      delete leftContentCopy.appData
    }
  }
  omitInPlace<Partial<C>>(leftContentCopy, keysToIgnore)

  const rightContentCopy: Partial<C> = sortedCopy(rightContent)
  if (rightContentCopy.appData) {
    const domainData = rightContentCopy.appData[DefaultAppDomain]
    omitInPlace(domainData, appDataKeysToIgnore)
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete rightContentCopy.appData
      }
    } else {
      delete rightContentCopy.appData
    }
  }
  omitInPlace<Partial<C>>(rightContentCopy, keysToIgnore)

  return JSON.stringify(leftContentCopy) === JSON.stringify(rightContentCopy)
}
