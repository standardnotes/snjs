import { findInArray } from '@Lib/utils';
import { PayloadSources } from '@Payloads/sources';
import { PurePayload } from '@Payloads/pure_payload';

interface PayloadMap {
  [name: string]: PurePayload
}

/**
 * A collection of payloads coming from a single source.
 */
export class PayloadCollection {

  readonly source?: PayloadSources
  readonly payloads: Array<PurePayload>
  readonly payloadMap: PayloadMap

  constructor(payloads: Array<PurePayload> = [], source?: PayloadSources) {
    this.source = source;
    this.payloadMap = {};
    this.payloads = payloads;
    for (const payload of payloads) {
      this.payloadMap[payload.uuid] = payload;
    }
    Object.freeze(this);
  }

  public getAllPayloads() {
    return this.payloads;
  }

  public findPayload(id: string) {
    return this.payloadMap[id];
  }

  public concat(inCollection: PayloadCollection) {
    const result = inCollection.getAllPayloads().slice();
    for (const ours of this.payloads) {
      /** If the payload exists in incoming collection, don't add our version */
      if (findInArray(inCollection.getAllPayloads(), 'uuid', ours.uuid)) {
        continue;
      }
      result.push(ours);
    }
    return new PayloadCollection(result, this.source);
  }

  public payloadsThatReferencePayload(payload: PurePayload) {
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
