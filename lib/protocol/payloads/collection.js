import { findInArray } from '@Lib/utils';

export class PayloadCollection {

  constructor({payloads = [], source} = {}) {
    this.source = source;
    this.payloadMap = {};
    this.allPayloads = payloads;
    for(const payload of payloads) {
      this.payloadMap[payload.uuid] = payload;
    }
    Object.freeze(this);
  }

  findPayload(id) {
    return this.payloadMap[id];
  }

  concat(collection) {
    return new PayloadCollection({
      payloads: this.allPayloads.concat(collection.allPayloads),
      source: this.source
    });
  }

  payloadsThatReferencePayload(inPayload) {
    const results = [];
    for(const uuid of Object.keys(this.payloadMap)) {
      const payload = this.payloadMap[uuid];
      const references = findInArray(
        payload.content.references,
        'uuid',
        inPayload.uuid
      );
      if(references) {
        results.push(payload);
      }
    }
    return results;
  }
}
