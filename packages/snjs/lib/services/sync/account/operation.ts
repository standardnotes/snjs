import { PurePayload } from '@standardnotes/payloads';
import { arrayByDifference, subtractFromArray } from '@standardnotes/utils';
import { SyncResponse } from '@Services/sync/response';
import { ResponseSignalReceiver, SyncSignal } from '@Services/sync/signals';
import { SNApiService } from '../../api/api_service';
import { RawSyncResponse } from '@standardnotes/responses';

export const SyncUpDownLimit = 150;

/**
 * A long running operation that handles multiple roundtrips from a server,
 * emitting a stream of values that should be acted upon in real time.
 */
export class AccountSyncOperation {
  public id = Math.random();

  private pendingPayloads: PurePayload[];
  private responses: SyncResponse[] = [];

  /**
   * @param payloads   An array of payloads to send to the server
   * @param receiver   A function that receives callback multiple times during the operation
   */
  constructor(
    private payloads: PurePayload[],
    private receiver: ResponseSignalReceiver,
    private lastSyncToken: string,
    private paginationToken: string,
    public checkIntegrity: boolean,
    private apiService: SNApiService
  ) {
    this.payloads = payloads;
    this.lastSyncToken = lastSyncToken;
    this.paginationToken = paginationToken;
    this.checkIntegrity = checkIntegrity;
    this.apiService = apiService;
    this.receiver = receiver;
    this.pendingPayloads = payloads.slice();
  }

  /**
   * Read the payloads that have been saved, or are currently in flight.
   */
  get payloadsSavedOrSaving() {
    return arrayByDifference(this.payloads, this.pendingPayloads);
  }

  popPayloads(count: number) {
    const payloads = this.pendingPayloads.slice(0, count);
    subtractFromArray(this.pendingPayloads, payloads);
    return payloads;
  }

  async run(): Promise<void> {
    await this.receiver(SyncSignal.StatusChanged, undefined, {
      completedUploadCount: this.totalUploadCount - this.pendingUploadCount,
      totalUploadCount: this.totalUploadCount,
    });
    const payloads = this.popPayloads(this.upLimit);
    const rawResponse = (await this.apiService.sync(
      payloads,
      this.lastSyncToken,
      this.paginationToken,
      this.downLimit,
      this.checkIntegrity,
      undefined,
      undefined
    )) as RawSyncResponse;
    const response = new SyncResponse(rawResponse);

    this.responses.push(response);
    this.lastSyncToken = response.lastSyncToken!;
    this.paginationToken = response.paginationToken!;

    try {
      await this.receiver(SyncSignal.Response, response);
    } catch (error) {
      console.error('Sync handle response error', error);
    }

    if (!this.done) {
      return this.run();
    }
  }

  get done() {
    return this.pendingPayloads.length === 0 && !this.paginationToken;
  }

  private get pendingUploadCount() {
    return this.pendingPayloads.length;
  }

  private get totalUploadCount() {
    return this.payloads.length;
  }

  private get upLimit() {
    return SyncUpDownLimit;
  }

  private get downLimit() {
    return SyncUpDownLimit;
  }

  get numberOfItemsInvolved() {
    let total = 0;
    for (const response of this.responses) {
      total += response.numberOfItemsInvolved;
    }
    return total;
  }
}
