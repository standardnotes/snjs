import { ImmutablePayloadCollection } from './../Collection/Payload/ImmutablePayloadCollection'
import { extendArray } from '@standardnotes/utils'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Abstract/Delta'
import {
  isErrorDecryptingPayload,
  isDecryptedPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { Uuid } from '@standardnotes/common'
import { HistoryMap } from '../History'
import { ServerSyncPushContextualPayload } from '../../Abstract/Contextual/ServerSyncPush'
import {
  payloadByRedirtyingBasedOnBaseState,
  payloadsByRedirtyingBasedOnBaseState,
} from './Utilities.ts/ApplyDirtyState'

export class DeltaRemoteRetrieved extends PayloadsDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection,
    applyCollection: ImmutablePayloadCollection,
    private itemsSavedOrSaving: ServerSyncPushContextualPayload[],
    historyMap: HistoryMap,
  ) {
    super(baseCollection, applyCollection, historyMap)
  }

  private isUuidOfPayloadCurrentlySavingOrSaved(uuid: Uuid): boolean {
    return this.itemsSavedOrSaving.find((i) => i.uuid === uuid) != undefined
  }

  public async resultingCollection(): Promise<
    ImmutablePayloadCollection<FullyFormedPayloadInterface>
  > {
    const filtered: FullyFormedPayloadInterface[] = []
    const conflicted: FullyFormedPayloadInterface[] = []

    /**
     * If we have retrieved an item that was saved as part of this ongoing sync operation,
     * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
     */
    for (const apply of this.applyCollection.all()) {
      const isSavedOrSaving = this.isUuidOfPayloadCurrentlySavingOrSaved(apply.uuid)

      if (isSavedOrSaving) {
        conflicted.push(apply)

        continue
      }

      const base = this.findBasePayload(apply.uuid)
      if (base?.dirty && !isErrorDecryptingPayload(base)) {
        conflicted.push(apply)

        continue
      }

      filtered.push(payloadByRedirtyingBasedOnBaseState(apply, this.baseCollection))
    }

    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    const conflictResults: FullyFormedPayloadInterface[] = []
    for (const conflict of conflicted) {
      if (!isDecryptedPayload(conflict)) {
        continue
      }

      const base = this.findBasePayload(conflict.uuid)
      if (!base) {
        continue
      }

      const delta = new ConflictDelta(this.baseCollection, base, conflict, this.historyMap)

      const deltaCollection = await delta.resultingCollection()

      const payloads = payloadsByRedirtyingBasedOnBaseState(
        deltaCollection.all(),
        this.baseCollection,
      )

      extendArray(conflictResults, payloads)
    }

    return ImmutablePayloadCollection.WithPayloads(filtered.concat(conflictResults))
  }
}
