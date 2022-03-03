import { filterDisallowedRemotePayloads } from '@Lib/services/Sync/Filter'
import {
  PurePayload,
  RawPayload,
  CreateSourcedPayloadFromObject,
  PayloadSource,
} from '@standardnotes/payloads'
import { ContentType } from '@standardnotes/common'
import { SNApiService } from '../../Api/ApiService'
import { SNProtocolService } from '../../ProtocolService'
import { RawSyncResponse } from '@standardnotes/responses'

type Progress = {
  retrievedPayloads: PurePayload[]
  lastSyncToken?: string
  paginationToken?: string
}

export class AccountDownloader {
  private apiService: SNApiService
  private protocolService: SNProtocolService
  private contentType?: ContentType
  private customEvent?: string
  private limit?: number
  private progress: Progress

  constructor(
    apiService: SNApiService,
    protocolService: SNProtocolService,
    contentType?: ContentType,
    customEvent?: string,
    limit?: number,
  ) {
    this.apiService = apiService
    this.protocolService = protocolService
    this.contentType = contentType
    this.customEvent = customEvent
    this.limit = limit
    this.progress = { retrievedPayloads: [] }
  }

  /**
   * Executes a sync request with a blank sync token and high download limit. It will download all items,
   * but won't do anything with them other than decrypting and creating respective objects.
   */
  async run(): Promise<PurePayload[]> {
    const response = (await this.apiService.sync(
      [],
      this.progress.lastSyncToken!,
      this.progress.paginationToken!,
      this.limit || 500,
      false,
      this.contentType,
      this.customEvent,
    )) as RawSyncResponse

    const encryptedPayloads = filterDisallowedRemotePayloads(
      response.data.retrieved_items!.map((rawPayload: RawPayload) => {
        return CreateSourcedPayloadFromObject(rawPayload, PayloadSource.RemoteRetrieved)
      }),
    )
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingPayloads(
      encryptedPayloads,
    )
    this.progress.retrievedPayloads = this.progress.retrievedPayloads.concat(decryptedPayloads)
    this.progress.lastSyncToken = response.data?.sync_token
    this.progress.paginationToken = response.data?.cursor_token

    if (response.data?.cursor_token) {
      return this.run()
    } else {
      return this.progress.retrievedPayloads
    }
  }
}