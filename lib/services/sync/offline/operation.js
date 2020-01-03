import {
  SIGNAL_TYPE_RESPONSE,
  SIGNAL_TYPE_STATUS_CHANGED
} from '@Services/sync/signals';

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

     const response = {payloads: outPayloads};
     this.receiver(response, SIGNAL_TYPE_RESPONSE);
     this.running = false;
   }

   lockCancelation() {
     this.cancelable = false;
   }

   unlockCancelation() {
     this.cancelable = true;
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
