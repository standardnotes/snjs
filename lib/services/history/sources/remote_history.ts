import { SNApiService } from "@Lib/services/api/api_service";
import { SNProtocolService } from "@Lib/services/protocol_service";
import { ItemHistory } from "../item_history";
import { HttpResponse } from "@Lib/services/api/http_service";
import { RawPayload, CreateMaxPayloadFromAnyObject, CreateSourcedPayloadFromObject } from "@Lib/protocol/payloads/generator";
import { ItemHistorySource, ItemHistoryEntry } from "../item_history_entry";
import { PayloadSource } from "@Lib/protocol/payloads";

export class RemoteHistory {
  private apiService: SNApiService
  private protocolService: SNProtocolService

  constructor(apiService: SNApiService, protocolService: SNProtocolService) {
    this.apiService = apiService;
    this.protocolService = protocolService;
  }

  /**
   * Iterates over the response and creates a payload from each entry.
   */
  private responseToPayloadArray(response: HttpResponse) {
    const revisions: RawPayload[] = response!.revisions;
    const revisionEntries = revisions.map((revision) => {
      return {
        payload: CreateMaxPayloadFromAnyObject(revision)
      };
    });
    return {
      entries: revisionEntries
    };
  }

  public async fetchItemHistory(itemUuid: string) {
    const serverResponse = await this.apiService!.getItemRevisions(itemUuid);
    if (serverResponse.error) {
      return {
        entries: []
      };
    }
    const payloadArray = this.responseToPayloadArray(serverResponse);
    const itemHistory = ItemHistory.FromJson(payloadArray, ItemHistorySource.Remote);
    return itemHistory;
  }

  /**
   * Creates a PurePayload from the response.
   */
  private responseToPayload(response: HttpResponse) {
    const rawPayload = response as Partial<RawPayload> as RawPayload;
    return CreateMaxPayloadFromAnyObject(rawPayload);
  }

  public async fetchItemRevision(itemUuid: string, revisionUuid: string) {
    const serverResponse = await this.apiService!.getRevisionForItem(itemUuid, revisionUuid);
    if (serverResponse.error) {
      return undefined;
    }
    const payload = this.responseToPayload(serverResponse);
    const encryptedPayload = CreateSourcedPayloadFromObject(payload, PayloadSource.RemoteHistory, {
      ...serverResponse,
      uuid: itemUuid,
    });
    const decryptedPayload = await this.protocolService!.payloadByDecryptingPayload(encryptedPayload);
    const itemHistoryEntry = new ItemHistoryEntry(decryptedPayload, ItemHistorySource.Remote);
    return itemHistoryEntry;
  }
}