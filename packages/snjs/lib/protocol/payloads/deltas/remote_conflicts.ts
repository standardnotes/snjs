import { SNLog } from './../../../log';
import { PayloadsDelta } from '@Payloads/deltas/delta';
import { ConflictDelta } from '@Payloads/deltas/conflict';
import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollection } from "@Protocol/collection/payload_collection";
import { PayloadsByAlternatingUuid } from '@Payloads/functions';
import { extendArray } from '@Lib/utils';
import { PurePayload } from '../pure_payload';
import { PayloadContent } from '@Lib/protocol';
import { CopyPayload } from '../generator';
import { ContentType } from '@Lib/models/content_types';

export class DeltaRemoteConflicts extends PayloadsDelta {

  public async resultingCollection() {
    if (this.applyCollection.source === PayloadSource.ConflictUuid) {
      return this.collectionsByHandlingUuidConflicts();
    } else if (this.applyCollection.source === PayloadSource.ConflictData) {
      return this.collectionsByHandlingDataConflicts();
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`;
    }
  }

  private async collectionsByHandlingDataConflicts() {
    const results = [];
    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid!);
      /** Could be deleted */
      if (!current) {
        results.push(payload);
        continue;
      }
      const decrypted = this.findRelatedPayload(
        payload.uuid!,
        PayloadSource.DecryptedTransient
      );
      if (!decrypted && !payload.deleted) {
        /** Decrypted should only be missing in case of deleted payload */
        throw 'Unable to find decrypted counterpart for data conflict.';
      }
      const delta = new ConflictDelta(
        this.baseCollection,
        current,
        decrypted || payload,
        PayloadSource.ConflictData
      );
      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.all();
      extendArray(results, payloads);
    }
    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved);
  }

  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */
  private async collectionsByHandlingUuidConflicts() {
    const results: Array<PurePayload> = [];

    const notes = []
    const tags = []
    const rest = []
    for (const item of this.applyCollection.all()
    ) {
      if (item.content_type === ContentType.Note) notes.push(item)
      else if (item.content_type === ContentType.Tag) tags.push(item)
      else rest.push(item)
    }

    const noteUuidOldToNew = new Map()
    for (const payload of notes) {
      const decrypted = this.findRelatedPayload(
        payload.uuid!,
        PayloadSource.DecryptedTransient
      );
      if (!decrypted) {
        this.errorLogMissingDecrypted(payload)
        continue;
      }

      const alternateResults = await PayloadsByAlternatingUuid(
        decrypted,
        this.baseCollection,
        false
      );
      extendArray(results, alternateResults);

      // note: depends on return order of PayloadsByAlternatingUuid
      const [updated] = alternateResults
      noteUuidOldToNew.set(payload.uuid, updated.uuid)
    }

    for (const payload of tags) {
      const decrypted = this.findRelatedPayload(
        payload.uuid!,
        PayloadSource.DecryptedTransient
      );
      if (!decrypted) {
        this.errorLogMissingDecrypted(payload)
        continue;
      }

      const {content} = decrypted
      const decryptedWithValidRefs = typeof content !== 'string' && typeof content !== 'undefined'?
        CopyPayload(decrypted, {
          content: {
            ...content,
            references: content.references.map(ref => {
              const {uuid} = ref
              return {
                ...ref,
                uuid: noteUuidOldToNew.has(uuid)? 
                  noteUuidOldToNew.get(uuid): 
                  uuid
              }
            })
          }
        }): 
        decrypted

      const alternateResults = await PayloadsByAlternatingUuid(
        decryptedWithValidRefs,
        this.baseCollection,
        false
      );
      extendArray(results, alternateResults);
    }

    for (const payload of rest) {
      /**
       * The payload in question may have been modified as part of alternating a uuid for
       * another item. For example, alternating a uuid for a note will also affect the
       * referencing tag, which would be added to `results`, but could also be inside
       * of this.applyCollection. In this case we'd prefer the most recently modified value.
       */
      const moreRecent = results.find(r => r.uuid === payload.uuid);
      const decrypted = moreRecent || this.findRelatedPayload(
        payload.uuid!,
        PayloadSource.DecryptedTransient
      );
      if (!decrypted) {
        this.errorLogMissingDecrypted(payload)
        continue;
      }
      const alternateResults = await PayloadsByAlternatingUuid(
        decrypted,
        this.baseCollection
      );
      extendArray(results, alternateResults);
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved);
  }

  private errorLogMissingDecrypted(payload: PurePayload): void {
    SNLog.error(Error('Cannot find decrypted payload in conflict handling'));
    console.error('Unable to find decrypted counterpart for payload', payload);
  }
}
