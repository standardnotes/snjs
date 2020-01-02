export const SIGNAL_TYPE_SERVER_RESPONSE = 1;
export const SIGNAL_TYPE_STATUS_CHANGED =  2;

const DEFAULT_UP_DOWN_LIMIT = 150;
const SERVER_VERSION = '052019';

export class AccountSyncOperation {

  /**
   * A long running operation that handles multiple roundtrips from a server,
   * emitting a stream of values that should be acted upon in real time.
   * Once an operation is created, no new values can be passed into it.
   * However, it can be cancleled at most pointss.
   * If an item changes that a current operation is handling, try canceling it,
   * then starting a new one. But once it returns values, those values should be acted upon.\
   */


   /**
    * @param payloads   An array of payloads to send to the server
    * @param receiver   A function that recieves callback multiple times during the operation
    *                   and takes two parameters: (payloads, actions)

    */
   constructor({
     payloads,
     receiver,
     lastSyncToken,
     paginationToken,
     checkIntegrity
   }) {
     this.payloads = payloads;
     this.pendingPayloads = payloads;
     this.lastSyncToken = lastSyncToken;
     this.paginationToken = paginationToken;
     this.checkIntegrity = checkIntegrity;
     this.receiver = receiver;

     this.responses = [];
   }

   /**
    * Read the payloads that have been saved, or are currently in flight.
    */
   get payloadsSavedOrSaving() {
     return differenceArrays(this.payloads, this.pendingPayloads);
   }

   popPayloads(count) {
     const payloads = this.pendingPayloads.slice(0, count);
     subtractArrays(this.pendingPayloads, payloads);
     return payloads;
   }

   async run() {
     if(this.cancleled) {
       return;
     }
     this.running = true;
     const payloads = this.popPayloads(this.upLimit);
     self.lockCancelation();
     const rawResponse = await this.apiService.sync({
       payloads: payloads,
       lastSyncToken: this.lastSyncToken,
       paginationToken: this.paginationToken,
       limit: this.downLimit,
       checkIntegrity: this.checkIntegrity
     });
     const response = new AccountSyncResponse(rawResponse);
     self.unlockCancelation();

     this.responses.push(response);
     this.lastSyncToken = response.lastSyncToken;
     this.paginationToken = response.paginationToken;

     const signal = {
       request: request,
       response: response
     };
     this.receiver(signal, SIGNAL_TYPE_SERVER_RESPONSE);

     const needsMoreSync = this.pendingPayloads.length > 0 || this.paginationToken;
     if(needsMoreSync) {
       return this.run();
     }
     this.running = false;
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
     for(const response this.responses) {
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
