import { ConflictType } from './../api/responses';
import { RawSyncResponse } from '@Lib/services/api/responses';
import { PurePayload } from '@Payloads/pure_payload';
import { deepFreeze, isNullOrUndefined } from '@Lib/utils';
import { ApiEndpointParam } from '@Services/api/keys';
import { PayloadSource } from '@Payloads/sources';
import {
  CreateSourcedPayloadFromObject,
  RawPayload,
} from '@Payloads/generator';

export class SyncResponse {
  public readonly rawResponse: RawSyncResponse;
  public readonly savedPayloads: PurePayload[];
  public readonly retrievedPayloads: PurePayload[];
  public readonly uuidConflictPayloads: PurePayload[];
  public readonly dataConflictPayloads: PurePayload[];
  public readonly rejectedPayloads: PurePayload[];
  public readonly deletedPayloads: PurePayload[];

  constructor(rawResponse: RawSyncResponse) {
    this.rawResponse = rawResponse;
    this.savedPayloads = this.filterRawItemArray(
      rawResponse.data?.saved_items
    ).map((rawItem) => {
      return CreateSourcedPayloadFromObject(rawItem, PayloadSource.RemoteSaved);
    });
    this.retrievedPayloads = this.filterRawItemArray(
      rawResponse.data?.retrieved_items
    ).map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.RemoteRetrieved
      );
    });
    this.dataConflictPayloads = this.filterRawItemArray(
      this.rawDataConflictItems
    ).map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.ConflictData
      );
    });
    this.uuidConflictPayloads = this.filterRawItemArray(
      this.rawUuidConflictItems
    ).map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.ConflictUuid
      );
    });
    this.rejectedPayloads = this.filterRawItemArray(
      this.rawRejectedPayloads
    ).map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.RemoteRejected
      );
    });
    /**
     * Items may be deleted from a combination of sources, such as from RemoteSaved,
     * or if a conflict handler decides to delete a payload.
     */
    this.deletedPayloads = this.allProcessedPayloads.filter((payload) => {
      return payload.discardable;
    });
    deepFreeze(this);
  }

  /**
   * Filter out and exclude any items that do not have a uuid. These are useless to us.
   */
  private filterRawItemArray(rawItems: RawPayload[] = []) {
    return rawItems.filter((rawItem) => {
      if (!rawItem.uuid) {
        return false;
      } else {
        return true;
      }
    });
  }

  public get error() {
    return this.rawResponse.error || this.rawResponse.data?.error;
  }

  /**
   * Returns the HTTP status code for invalid requests
   */
  public get status(): number {
    return this.rawResponse.status!;
  }

  public get lastSyncToken() {
    return this.rawResponse.data?.[ApiEndpointParam.LastSyncToken];
  }

  public get paginationToken() {
    return this.rawResponse.data?.[ApiEndpointParam.PaginationToken];
  }

  public get integrityHash() {
    return this.rawResponse.data?.[ApiEndpointParam.IntegrityResult];
  }

  get checkIntegrity() {
    return this.integrityHash && !this.paginationToken;
  }

  public get numberOfItemsInvolved() {
    return this.allProcessedPayloads.length;
  }

  public get allProcessedPayloads() {
    const allPayloads = this.savedPayloads
      .concat(this.retrievedPayloads)
      .concat(this.dataConflictPayloads)
      .concat(this.uuidConflictPayloads)
      .concat(this.rejectedPayloads);
    return allPayloads;
  }

  private get rawUuidConflictItems() {
    return this.rawConflictObjects
      .filter((conflict) => {
        return conflict.type === ConflictType.UuidConflict;
      })
      .map((conflict) => {
        return conflict.unsaved_item! || conflict.item!;
      });
  }

  private get rawDataConflictItems() {
    return this.rawConflictObjects
      .filter((conflict) => {
        return conflict.type === ConflictType.ConflictingData;
      })
      .map((conflict) => {
        return conflict.server_item! || conflict.item!;
      });
  }

  private get rawRejectedPayloads() {
    return this.rawConflictObjects
      .filter((conflict) => {
        return (
          conflict.type === ConflictType.ContentTypeError ||
          conflict.type === ConflictType.ContentError
        );
      })
      .map((conflict) => {
        return conflict.unsaved_item!;
      });
  }

  private get rawConflictObjects() {
    const conflicts = this.rawResponse.data?.conflicts || [];
    const legacyConflicts = this.rawResponse.data?.unsaved || [];
    return conflicts.concat(legacyConflicts);
  }

  public get hasError() {
    return !isNullOrUndefined(this.rawResponse.error);
  }
}
