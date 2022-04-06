import { PayloadInterface } from './../../Abstract/Payload/Interfaces/PayloadInterface'
import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Delta'
import {
  isDeletedPayload,
  isErrorDecryptingPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'

export class DeltaRemoteRetrieved extends PayloadsDelta {
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const filtered: Array<PayloadInterface> = []
    const conflicted: Array<PayloadInterface> = []

    /**
     * If we have retrieved an item that was saved as part of this ongoing sync operation,
     * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
     */
    for (const received of this.applyCollection.all()) {
      const savedOrSaving = this.findRelatedPayload(
        received.uuid as string,
        PayloadSource.SavedOrSaving,
      )

      const decrypted = this.findRelatedDecryptedTransientPayload(received.uuid as string)
      if (!decrypted) {
        /** Decrypted should only be missing in case of deleted retrieved item */
        if (!isDeletedPayload(received)) {
          console.error('Cannot find decrypted for non-deleted payload.')
          continue
        }
        filtered.push(received)
        continue
      }

      if (savedOrSaving) {
        conflicted.push(decrypted)
        continue
      }

      const base = this.findBasePayload(received.uuid as string)
      if (base?.dirty && !isErrorDecryptingPayload(base)) {
        conflicted.push(decrypted)
        continue
      }

      filtered.push(decrypted)
    }

    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    const conflictResults: Array<PayloadInterface> = []
    for (const conflict of conflicted) {
      const decrypted = this.findRelatedDecryptedTransientPayload(conflict.uuid)
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
