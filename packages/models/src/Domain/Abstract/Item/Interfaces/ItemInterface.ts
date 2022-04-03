import { Uuid, ProtocolVersion, ContentType } from '@standardnotes/common'
import { PayloadInterface } from '../../Payload/Interfaces/PayloadInterface'
import { PredicateInterface } from '../../../Runtime/Predicate/Interface'
import { HistoryEntryInterface } from '../../../Runtime/History'
import { ConflictStrategy } from '../Types/ConflictStrategy'

export interface ItemInterface<P extends PayloadInterface = PayloadInterface> {
  payload: P
  readonly conflictOf?: Uuid
  readonly duplicateOf?: Uuid
  readonly createdAtString?: string
  readonly updatedAtString?: string

  uuid: Uuid
  version: ProtocolVersion

  content_type: ContentType
  created_at: Date
  serverUpdatedAt: Date
  serverUpdatedAtTimestamp: number | undefined
  dirtiedDate: Date | undefined
  dirty: boolean | undefined

  lastSyncBegan: Date | undefined
  lastSyncEnd: Date | undefined
  duplicate_of: string | undefined
  neverSynced: boolean
  isSingleton: boolean
  isSyncable: boolean
  updated_at: Date | undefined

  singletonPredicate<T extends ItemInterface>(): PredicateInterface<T>

  singletonStrategy: any

  strategyWhenConflictingWithItem(
    item: ItemInterface,
    previousRevision?: HistoryEntryInterface,
  ): ConflictStrategy

  satisfiesPredicate(predicate: any): boolean

  payloadRepresentation(override?: Partial<P>): P
}
