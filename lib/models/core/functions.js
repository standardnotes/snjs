import { omitInPlace } from '@Lib/utils';

export function ItemContentsEqual({leftContent, rightContent, keysToIgnore, appDataKeysToIgnore}) {
  // Create copies of objects before running omit as not to modify source values directly.
  leftContent = JSON.parse(JSON.stringify(leftContent));
  if(leftContent.appData) {
    const domainData = leftContent.appData[SFItem.AppDomain];
    omitInPlace(domainData, appDataKeysToIgnore);
    /**
     * We don't want to disqualify comparison if one object contains an empty domain object
     * and the other doesn't contain a domain object. This can happen if you create an item
     * without setting dirty, which means it won't be initialized with a client_updated_at
     */
    if(domainData) {
      if(Object.keys(domainData).length === 0) {
        delete leftContent.appData;
      }
    } else {
      delete leftContent.appData;
    }

  }
  leftContent = omitInPlace(leftContent, keysToIgnore);

  rightContent = JSON.parse(JSON.stringify(rightContent));
  if(rightContent.appData) {
    const domainData = rightContent.appData[SFItem.AppDomain];
    omitInPlace(domainData, appDataKeysToIgnore);
    if(domainData) {
      if(Object.keys(domainData).length === 0) {
        delete rightContent.appData;
      }
    } else {
      delete rightContent.appData;
    }
  }
  rightContent = omitInPlace(rightContent, keysToIgnore);

  return JSON.stringify(leftContent) === JSON.stringify(rightContent);
}


export function ItemContentsDiffer(item1, item2, excludeContentKeys) {
  if(!excludeContentKeys) {
    excludeContentKeys = [];
  }
  return !ItemContentsEqual({
    leftContent: item1.content,
    rightContent: item2.content,
    keysToIgnore: item1.contentKeysToIgnoreWhenCheckingEquality().concat(excludeContentKeys),
    appDataKeysToIgnore: item1.appDatacontentKeysToIgnoreWhenCheckingEquality()
  })
}
