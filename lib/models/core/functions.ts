import { SNItem } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import { omitInPlace } from '@Lib/utils';
import { DEFAULT_APP_DOMAIN } from '@Lib/index';

export function ItemContentsEqual(
  leftContent: PayloadContent,
  rightContent: PayloadContent,
  keysToIgnore: string[],
  appDataKeysToIgnore: string[]
) {
  /* Create copies of objects before running omit as not to modify source values directly. */
  leftContent = JSON.parse(JSON.stringify(leftContent));
  if (leftContent.appData) {
    const domainData = leftContent.appData[DEFAULT_APP_DOMAIN];
    omitInPlace(domainData, appDataKeysToIgnore);
    /**
     * We don't want to disqualify comparison if one object contains an empty domain object
     * and the other doesn't contain a domain object. This can happen if you create an item
     * without setting dirty, which means it won't be initialized with a client_updated_at
     */
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete leftContent.appData;
      }
    } else {
      delete leftContent.appData;
    }

  }
  omitInPlace(leftContent, keysToIgnore);

  rightContent = JSON.parse(JSON.stringify(rightContent));
  if (rightContent.appData) {
    const domainData = rightContent.appData[DEFAULT_APP_DOMAIN];
    omitInPlace(domainData, appDataKeysToIgnore);
    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete rightContent.appData;
      }
    } else {
      delete rightContent.appData;
    }
  }
  omitInPlace(rightContent, keysToIgnore);

  return JSON.stringify(leftContent) === JSON.stringify(rightContent);
}

export function ItemContentsDiffer(
  item1: SNItem,
  item2: SNItem,
  excludeContentKeys?: string[]
) {
  if (!excludeContentKeys) {
    excludeContentKeys = [];
  }
  return !ItemContentsEqual(
    item1.content,
    item2.content,
    item1.contentKeysToIgnoreWhenCheckingEquality().concat(excludeContentKeys),
    item1.appDatacontentKeysToIgnoreWhenCheckingEquality()
  );
}
