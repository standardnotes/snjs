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
    * @param serverUrl  The base url of the server to exchange payload data with.
    * @param payloads   An array of payloads to send to the server
    * @param receiver   A function that recieves callback multiple times during the operation
    *                   and takes two parameters: (payloads, actions)

    */
   constructor({
     serverUrl,
     sync_token,
     cursor_token,
     payloads,
     performIntegrityCheck,
     receiver
   }) {
     this.serverUrl = url;
     this.payloads = payloads;
     this.pendingPayloads = payloads;
     this.syncToken = syncToken;
     this.cursorToken = cursorToken;
     this.performIntegrityCheck = performIntegrityCheck;
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
     this.running = true;
     const payloads = this.popPayloads(this.upLimit);
     const request = new SyncServerRequest({
       serverUrl: this.serverUrl,
       send: subPayloads,
       syncToken: this.syncToken,
       cursorToken: this.cursorToken,
       version: SERVER_VERSION
     });

     if(this.cancleled) {
       return;
     }
     self.lockCancelation();
     const response = await request.run();
     self.unlockCancelation();

     this.responses.push(response);
     this.syncToken = response.sync_token;
     this.cursorToken = response.cursor_token;

     const signal = {
       request: request,
       response: response
     };
     this.receiver(signal, SIGNAL_TYPE_SERVER_RESPONSE);

     const needsMoreSync = this.pendingPayloads.length > 0 || this.cursorToken;
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
