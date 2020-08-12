import { SNApiService } from "@Lib/services/api/api_service";
import { SNProtocolService } from "@Lib/services/protocol_service";
import { ItemHistory } from "../item_history";
import { HttpResponse } from "@Lib/services/api/http_service";
import { RawPayload, CreateMaxPayloadFromAnyObject, CreateSourcedPayloadFromObject } from "@Lib/protocol/payloads/generator";
import { ItemHistorySource, ItemHistoryEntry } from "../item_history_entry";
import { PayloadSource } from "@Lib/protocol/payloads";
import { ContentType } from "@Lib/models";

type RawRevision = RawPayload & {
  item_id: string
}

type RawRevisionListItem = {
  uuid: string
  content_type: ContentType
  created_at: Date
  updated_at: Date
}

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
    delete response.error;
    delete response.status;
    return Object.keys(response).map((key) => {
      const revision = response[key] as RawRevisionListItem;
      return {
        payload: CreateMaxPayloadFromAnyObject(revision)
      }
    });
  }

  public async fetchItemHistory(itemUuid: string) {
    const payloadArray = {
      entries: new Array
    };
    const serverResponse = await this.apiService!.getItemRevisions(itemUuid);
    if (serverResponse.error) {
      return payloadArray;
    }
    payloadArray.entries = this.responseToPayloadArray(serverResponse);
    const itemHistory = ItemHistory.FromJson(payloadArray, ItemHistorySource.Remote);
    return itemHistory;
  }

  public async fetchItemRevision(itemUuid: string, revisionUuid: string) {
    const serverResponse = await this.apiService!.getRevisionForItem(itemUuid, revisionUuid);
    if (serverResponse.error) {
      return undefined;
    }
    const payload = serverResponse as unknown as RawRevision;
    const encryptedPayload = CreateSourcedPayloadFromObject(payload, PayloadSource.RemoteHistory, {
      uuid: itemUuid,
    });
    const decryptedPayload = await this.protocolService!.payloadByDecryptingPayload(encryptedPayload);
    const itemHistoryEntry = new ItemHistoryEntry(decryptedPayload, ItemHistorySource.Remote);
    return itemHistoryEntry;
  }
}