import { SNApiService } from "@Lib/services/api/api_service";
import { SNProtocolService } from "@Lib/services/protocol_service";
import { ItemHistory, ItemHistoryJson } from "../item_history";
import { HttpResponse } from "@Lib/services/api/http_service";
import { 
  RawPayload,
  CreateMaxPayloadFromAnyObject,
  CreateSourcedPayloadFromObject
} from "@Lib/protocol/payloads/generator";
import { ItemHistorySource, ItemHistoryEntry } from "../item_history_entry";
import { PayloadSource } from "@Lib/protocol/payloads";
import { ContentType } from "@Lib/models";
import { Copy } from "@Lib/utils";

type RawRevisionPayload = RawPayload & {
  item_id: string
}

type ItemHistoryJsonEntry = {
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
  private responseToItemHistoryJson(response: HttpResponse) {
    const result: ItemHistoryJson = {
      entries: []
    };
    Object.keys(response).map((key) => {
      if (key === 'error' || key === 'status') {
        return;
      }
      const historyEntry = response[key] as ItemHistoryJsonEntry;
      result.entries.push({
        payload: CreateMaxPayloadFromAnyObject(historyEntry)
      });
    });
    return result;
  }

  public async fetchItemHistory(itemUuid: string) {
    const serverResponse = await this.apiService!.getItemRevisions(itemUuid);
    if (serverResponse.error) {
      return new ItemHistory();
    }
    const entryJson = this.responseToItemHistoryJson(serverResponse);
    const itemHistory = ItemHistory.FromJson(entryJson, ItemHistorySource.Remote);
    return itemHistory;
  }

  public async fetchItemRevision(itemUuid: string, revisionUuid: string) {
    const serverResponse = await this.apiService!.getRevisionForItem(itemUuid, revisionUuid);
    if (serverResponse.error) {
      return undefined;
    }
    const payload = Copy(serverResponse) as RawRevisionPayload;
    const encryptedPayload = CreateSourcedPayloadFromObject(payload, PayloadSource.RemoteHistory, {
      uuid: itemUuid,
    });
    const decryptedPayload = await this.protocolService!.payloadByDecryptingPayload(encryptedPayload);
    const itemHistoryEntry = new ItemHistoryEntry(decryptedPayload, ItemHistorySource.Remote);
    return itemHistoryEntry;
  }
}