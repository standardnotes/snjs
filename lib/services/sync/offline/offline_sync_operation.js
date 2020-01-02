export const SIGNAL_TYPE_OFFLINE_RESPONSE = 1;

export class OfflineSyncOperation {

   /**
    * @param payloads  An array of payloads to sync offline
    * @param receiver  A function that recieves callback multiple times during the operation
    *                  and takes two parameters: (payloads, actions)
    */
   constructor({payloads, receiver}) {
     this.payloads = payloads;
     this.receiver = receiver;
   }

   async run() {
     this.running = true;
     const outPayloads = [];
     for(const payload of this.payloads) {
       outPayloads.push(CreatePayloadFromAnyObject({
         object: payload,
         override: {
           updated_at: new Date(),
           dirty: false
         }
       }))
     }

     const signal = {response: outPayloads};
     this.receiver(signal, SIGNAL_TYPE_SERVER_RESPONSE);
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

   tryCancel() {
     if(!this.cancelable) {
       this.cancleled = true;
       return true;
     } else {
       return false;
     }
   }

}
