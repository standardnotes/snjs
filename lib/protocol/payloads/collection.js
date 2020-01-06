import { findInArray, deepFreeze } from '@Lib/utils';

export class PayloadCollection {

  constructor({payloads, source} = {}) {
    if(!payloads) {payloads = [];}
    this.source = source;
    this.payloads = {};
    this.allPayloads = payloads;
    for(const payload of payloads) {
      this.payloads[payload.uuid] = payload;
    }
    Object.freeze(this);
  }

  findPayload(id) {
    return this.payloads[id];
  }

  concat(collection) {
    return new PayloadCollection({
      payloads: this.allPayloads.concat(collection.allPayloads),
      source: this.source
    })
  }

  payloadsThatReferencePayload(inPayload) {
    const results = [];
    for(const id of Object.keys(this.payloads)) {
      const payload = this.payloads[id];
      const inReferences = findInArray(
        payload.content.references,
        'uuid',
        inPayload.uuid
      );
      if(inReferences)  {
        results.push(payload);
      }
    }
    return results;
  }

}
