import { arrayByDifference } from '@Lib/utils';
import { AccountSyncResponse } from '@Services/sync/account/response';
import {
  SIGNAL_TYPE_RESPONSE,
  SIGNAL_TYPE_STATUS_CHANGED
} from '@Services/sync/signals';
import {
  DEFAULT_UP_DOWN_LIMIT,
  API_VERSION
} from '@Services/sync/constants';

export class AccountSyncOperation {
  /**
   * A long running operation that handles multiple roundtrips from a server,
   * emitting a stream of values that should be acted upon in real time.
   * @param payloads   An array of payloads to send to the server
   * @param receiver   A function that recieves callback multiple times during the operation
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
     if(this.cancleled) {
       return;
     }
     const payloads = this.popPayloads(this.upLimit);
     this.lockCancelation();
     const rawResponse = await this.apiService.sync({
       payloads: payloads,
       lastSyncToken: this.lastSyncToken,
       paginationToken: this.paginationToken,
       limit: this.downLimit,
       checkIntegrity: this.checkIntegrity
     });
     const response = new AccountSyncResponse(rawResponse);
     this.unlockCancelation();

     this.responses.push(response);
     this.lastSyncToken = response.lastSyncToken;
     this.paginationToken = response.paginationToken;

     await this.receiver(response, SIGNAL_TYPE_RESPONSE);

     const needsMoreSync = this.pendingPayloads.length > 0 || this.paginationToken;
     if(needsMoreSync) {
       return this.run();
     }
   }

   lockCancelation() {
     this.cancelable = false;
   }

   unlockCancelation() {
     this.cancelable = true;
   }

   get upLimit() {
     return DEFAULT_UP_DOWN_LIMIT;
   }

   get downLimit() {
     return DEFAULT_UP_DOWN_LIMIT;
   }

   get numberOfItemsInvolved() {
     let total = 0;
     for(const response of this.responses) {
       total += response.numberOfItemsInvolved;
     }
     return total;
   }

   tryCancel() {
     if(!this.cancelable) {
       this.cancleled = true;
       return true;
     } else {
       return false;
     }
   }

}
