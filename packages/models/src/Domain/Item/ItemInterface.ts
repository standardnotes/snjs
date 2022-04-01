/* eslint-disable @typescript-eslint/no-explicit-any */
import { Uuid, ProtocolVersion, ContentType } from '@standardnotes/common'
import { AppDataField } from './AppDataField'
import { AppData, ComponentDataDomain, DefaultAppDomain } from './DefaultAppDomain'
import { PayloadContent } from '../Payload/PayloadContent'
import { PayloadInterface } from '../Payload/PayloadInterface'
import { PayloadOverride } from '../Payload/PayloadOverride'
import { PredicateInterface } from '../Predicate/Interface'
import { ContentReference } from '../Reference/ContentReference'

export interface ItemContent extends PayloadContent {
  protected: boolean
  trashed: boolean
  pinned: boolean
  archived: boolean
  locked: boolean
  appData: AppData
}

export interface ItemInterface<C extends ItemContent = ItemContent> {
  readonly payload: PayloadInterface
  readonly conflictOf?: Uuid
  readonly duplicateOf?: Uuid
  readonly createdAtString?: string
  readonly updatedAtString?: string
  readonly protected: boolean
  readonly trashed: boolean
  readonly pinned: boolean
  readonly archived: boolean
  readonly locked: boolean
  readonly userModifiedDate: Date
  uuid: Uuid
  content: string | C | undefined
  version: ProtocolVersion
  safeContent: C
  references: ContentReference[]
  content_type: ContentType
  created_at: Date
  deleted: boolean | undefined
  serverUpdatedAt: Date | undefined
  serverUpdatedAtTimestamp: number | undefined
  dirtiedDate: Date | undefined
  dirty: boolean | undefined
  errorDecrypting: boolean | undefined
  waitingForKey: boolean | undefined
  errorDecryptingValueChanged: boolean | undefined
  lastSyncBegan: Date | undefined
  lastSyncEnd: Date | undefined
  duplicate_of: string | undefined
  neverSynced: boolean
  isSingleton: boolean
  isSyncable: boolean
  updated_at: Date | undefined
  auth_hash: string | undefined
  auth_params: any | undefined
  singletonPredicate<T extends ItemInterface>(): PredicateInterface<T>
  singletonStrategy: any
  strategyWhenConflictingWithItem(item: ItemInterface, previousRevision?: any): any
  satisfiesPredicate(predicate: any): boolean
  getAppDomainValue(key: any): any
  isItemContentEqualWith(otherItem: ItemInterface): boolean
  payloadRepresentation(override?: PayloadOverride): PayloadInterface
  hasRelationshipWithItem(item: ItemInterface): boolean
  getDomainData(
    domain: typeof ComponentDataDomain | typeof DefaultAppDomain,
  ): undefined | Record<string, any>
  contentKeysToIgnoreWhenCheckingEquality(): (keyof C)[]
  appDataContentKeysToIgnoreWhenCheckingEquality(): AppDataField[]
  getContentCopy(): C
}
