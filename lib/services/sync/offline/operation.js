import { CopyPayload } from '@Payloads';
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
     const responsePayloads = this.payloads.map((payload) => {
       return CopyPayload({
         payload: payload,
         override: {
           dirty: false
         }
       })
     });
     const response = {payloads: responsePayloads};
     await this.receiver(response, SIGNAL_TYPE_RESPONSE);
   }
}
