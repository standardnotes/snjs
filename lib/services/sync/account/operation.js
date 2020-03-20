import { arrayByDifference, subtractFromArray } from '@Lib/utils';
import { AccountSyncResponse } from '@Services/sync/account/response';
import { SIGNAL_TYPE_RESPONSE } from '@Services/sync/signals';

const DEFAULT_UP_DOWN_LIMIT = 150;

/**
 * A long running operation that handles multiple roundtrips from a server,
 * emitting a stream of values that should be acted upon in real time.
 */
export class AccountSyncOperation {
  /**
   * @param payloads   An array of payloads to send to the server
   * @param receiver   A function that receives callback multiple times during the operation
   *                   and takes two parameters: (payloads, actions)
   */
  constructor({
    payloads,
    receiver,
    lastSyncToken,
    paginationToken,
    checkIntegrity,
    apiService
  }) {
    this.payloads = payloads;
    this.pendingPayloads = payloads;
    this.lastSyncToken = lastSyncToken;
    this.paginationToken = paginationToken;
    this.checkIntegrity = checkIntegrity;
    this.apiService = apiService;
    this.receiver = receiver;

    /** @access private */
    this.responses = [];
  }

  /**
   * Read the payloads that have been saved, or are currently in flight.
   */
  get payloadsSavedOrSaving() {
    return arrayByDifference(this.payloads, this.pendingPayloads);
  }

  popPayloads(count) {
    const payloads = this.pendingPayloads.slice(0, count);
    subtractFromArray(this.pendingPayloads, payloads);
    return payloads;
  }

  async run() {
    const payloads = this.popPayloads(this.upLimit);
    const rawResponse = await this.apiService.sync({
      payloads: payloads,
      lastSyncToken: this.lastSyncToken,
      paginationToken: this.paginationToken,
      limit: this.downLimit,
      checkIntegrity: this.checkIntegrity
    });
    const response = new AccountSyncResponse(rawResponse);

    this.responses.push(response);
    this.lastSyncToken = response.lastSyncToken;
    this.paginationToken = response.paginationToken;

    await this.receiver(response, SIGNAL_TYPE_RESPONSE);

    if (!this.done) {
      return this.run();
    }
  }

  get done() {
    return this.pendingPayloads.length === 0 && !this.paginationToken;
  }

  get upLimit() {
    return DEFAULT_UP_DOWN_LIMIT;
  }

  get downLimit() {
    return DEFAULT_UP_DOWN_LIMIT;
  }

  get numberOfItemsInvolved() {
    let total = 0;
    for (const response of this.responses) {
      total += response.numberOfItemsInvolved;
    }
    return total;
  }
}
