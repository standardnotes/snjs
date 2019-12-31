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
    * @param url  The url of the server to exchange payload data with.
    * @param payloads  An array of payloads to send to the server
    * @param receiver  A function that recieves callback multiple times during the operation
    *                  and takes two parameters: (payloads, actions)

    */
   constructor({
     url,
     sync_token,
     cursor_token,
     payloads,
     performIntegrityCheck,
     receiver
   }) {
     this.url = url;
     this.payloads = payloads;
     this.syncToken = syncToken;
     this.cursorToken = cursorToken;
     this.performIntegrityCheck = performIntegrityCheck;
     this.receiver = receiver;
   }

   popPayloads(count) {
     const payloads = this.payloads.slice(0, count);
     subtractArrays(this.payloads, payloads);
     return payloads;
   }

   async run() {
     const payloads = this.popPayloads(this.upLimit);
     const request = new SyncServerRequest({
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

     this.syncToken = response.sync_token;
     this.cursorToken = response.cursor_token;

     const signal = {
       request: request,
       response: response
     };
     this.receiver(signal, SIGNAL_TYPE_SERVER_RESPONSE);

     const needsMoreSync = this.payloads.length > 0 || this.cursorToken;
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

   tryCancel() {
     if(!this.cancelable) {
       this.cancleled = true;
       return true;
     } else {
       return false;
     }
   }

}
