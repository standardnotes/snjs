/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataField, Uuid, ProtocolVersion, ContentType } from '@standardnotes/common'
import { PayloadContent } from '../Payload/PayloadContent'
import { PayloadInterface } from '../Payload/PayloadInterface'
import { PayloadOverride } from '../Payload/PayloadOverride'
import { ContentReference } from '../Tag/ContentReference'

export interface ItemInterface {
  readonly payload: PayloadInterface
  readonly conflictOf?: Uuid
  readonly duplicateOf?: Uuid
  readonly createdAtString?: string
  readonly updatedAtString?: string
  readonly protected: false
  readonly trashed: false
  readonly pinned: false
  readonly archived: false
  readonly locked: false
  readonly userModifiedDate: Date
  uuid: Uuid
  content: string | PayloadContent | undefined
  version: ProtocolVersion
  safeContent: PayloadContent
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
  singletonPredicate: any
  singletonStrategy: any
  strategyWhenConflictingWithItem(item: ItemInterface, previousRevision?: any): any
  satisfiesPredicate(predicate: any): boolean
  getAppDomainValue(key: any): any
  isItemContentEqualWith(otherItem: ItemInterface): boolean
  payloadRepresentation(override?: PayloadOverride): PayloadInterface
  hasRelationshipWithItem(item: ItemInterface): boolean
  getDomainData(domain: string): undefined | Record<string, any>
  contentKeysToIgnoreWhenCheckingEquality(): string[]
  appDataContentKeysToIgnoreWhenCheckingEquality(): AppDataField[]
  getContentCopy(): PayloadContent
}
