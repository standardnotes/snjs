import { ImmutablePayloadCollection } from './../Collection/Payload/ImmutablePayloadCollection'
import { PayloadInterface } from './../../Abstract/Payload/Interfaces/PayloadInterface'
import { extendArray } from '@standardnotes/utils'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Delta'
import {
  isDeletedPayload,
  isErrorDecryptingPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'
import {
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'
import { Uuid } from '@standardnotes/common'
import { ImmutablePayloadCollectionSet } from '../Collection/Payload/ImmutablePayloadCollectionSet'
import { HistoryMap } from '../History'
import { ServerSyncPushContextualPayload } from '../../Abstract/Contextual/ServerSyncPush'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaRemoteRetrieved extends PayloadsDelta<
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface | DeletedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface
> {
  constructor(
    baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    applyCollection: ImmutablePayloadCollection<
      EncryptedPayloadInterface | DeletedPayloadInterface
    >,
    private itemsSavedOrSaving: ServerSyncPushContextualPayload[],
    relatedCollectionSet?: ImmutablePayloadCollectionSet<FullyFormedPayloadInterface>,
    historyMap?: HistoryMap,
  ) {
    super(baseCollection, applyCollection, relatedCollectionSet, historyMap)
  }

  private isUuidOfPayloadCurrentlySavingOrSaved(uuid: Uuid): boolean {
    return this.itemsSavedOrSaving.find((i) => i.uuid === uuid) != undefined
  }

  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const filtered: Return[] = []
    const conflicted: Array<PayloadInterface> = []

    /**
     * If we have retrieved an item that was saved as part of this ongoing sync operation,
     * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
     */
    for (const received of this.applyCollection.all()) {
      const savedOrSaving = this.isUuidOfPayloadCurrentlySavingOrSaved(received.uuid)

      const postProcessedCounterpart = this.findRelatedPostProcessedPayload(received.uuid)
      if (!postProcessedCounterpart) {
        /** Should only be missing in case of deleted retrieved item */
        if (isDeletedPayload(received)) {
          filtered.push(received)
        }

        continue
      }

      if (savedOrSaving) {
        conflicted.push(postProcessedCounterpart)
        continue
      }

      const base = this.findBasePayload(received.uuid)
      if (base?.dirty && !isErrorDecryptingPayload(base)) {
        conflicted.push(postProcessedCounterpart)
        continue
      }

      filtered.push(postProcessedCounterpart as Return)
    }

    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    const conflictResults: Return[] = []
    for (const conflict of conflicted) {
      const decrypted = this.findRelatedPostProcessedPayload(conflict.uuid)
      if (!decrypted) {
        continue
      }

      const current = this.findBasePayload(conflict.uuid)
      if (!current) {
        continue
      }

      const delta = new ConflictDelta(
        this.baseCollection,
        current,
        decrypted,
        PayloadSource.ConflictData,
      )

      const deltaCollection = await delta.resultingCollection()
      const payloads = deltaCollection.all()
      extendArray(conflictResults, payloads)
    }

    return ImmutablePayloadCollection.WithPayloads(
      filtered.concat(conflictResults),
      PayloadSource.RemoteRetrieved,
    )
  }
}