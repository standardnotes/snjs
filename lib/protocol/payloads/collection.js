import { findInArray } from '@Lib/utils';

/**
 * A collection of payloads coming from a single source.
 */
export class PayloadCollection {
  constructor({ payloads = [], source } = {}) {
    this.source = source;
    this.payloadMap = {};
    this.allPayloads = payloads;
    for (const payload of payloads) {
      this.payloadMap[payload.uuid] = payload;
    }
    Object.freeze(this);
  }

  findPayload(id) {
    return this.payloadMap[id];
  }

  concat(inCollection) {
    const result = inCollection.allPayloads.slice();
    for (const ours of this.allPayloads) {
      /** If the payload exists in incoming collection, don't add our version */
      if (findInArray(inCollection.allPayloads, 'uuid', ours.uuid)) {
        continue;
      }
      result.push(ours);
    }
    return new PayloadCollection({
      payloads: result,
      source: this.source
    });
  }

  payloadsThatReferencePayload(payload) {
    const results = [];
    for (const uuid of Object.keys(this.payloadMap)) {
      const candidate = this.findPayload(uuid);
      if(candidate.errorDecrypting) {
        continue;
      }
      const references = findInArray(
        candidate.content.references,
        'uuid',
        payload.uuid
      );
      if (references) {
        results.push(candidate);
      }
    }
    return results;
  }
}
