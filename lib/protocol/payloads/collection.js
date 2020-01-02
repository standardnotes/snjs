import { findInArray } from '@Lib/utils'; 

export class SNPayloadCollection {

  constructor() {
    this.payloads = {};
  }

  setPayload(payload) {
    this.payloads[payload.uuid] = payload;
  }

  findPayload(id) {
    return this.payloads[id];
  }

  removePayload(payload) {
    delete this.payloads[payload.uuid];
  }

  removePayloadId(id) {
    delete this.payloads[id];
  }

  payloadsThatReferencePaylod(inPayload) {
    const results = [];
    for(const id of Object.keys(this.payloads)) {
      const payload = this.payloads[id];
      if(findInArray(payload.content.references, 'uuid', inPayload.uuid))  {
        results.push(payload);
      }
    }
    return results;
  }

}
