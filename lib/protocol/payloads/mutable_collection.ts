import remove from 'lodash/remove';
import { ContentType } from '@Models/content_types';
import { PayloadCollection } from '@Payloads/collection';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';

type PayloadMap = Partial<Record<UuidString, PurePayload>>
type ContentTypeMap = Partial<Record<ContentType, PurePayload[]>>

export class MutablePayloadCollection {

  private readonly map: PayloadMap = {}
  private readonly typedMap: ContentTypeMap = {}

  constructor(payloads: Array<PurePayload> = []) {
    for (const payload of payloads) {
      this.map[payload.uuid!] = payload;
      this.setToTypedMap(payload);
    }
  }
  
  private setToTypedMap(payload: PurePayload) {
    const array = this.typedMap[payload.content_type!] || [] as PurePayload[];
    remove(array, { uuid: payload.uuid! });
    array.push(payload);
    this.typedMap[payload.content_type!] = array;
  }

  private deleteFromTypedMap(payload: PurePayload) {
    const array = this.typedMap[payload.content_type!] || [] as PurePayload[];
    remove(array, { uuid: payload.uuid! });
    this.typedMap[payload.content_type!] = array;
  }

  public getAllPayloads(): PurePayload[] {
    return Object.keys(this.map).map((uuid: UuidString) => {
      return this.map[uuid]!;
    });
  }

  public getPayloadsForContentType(type: ContentType) {
    return this.typedMap[type];
  }

  public findPayload(id: UuidString) {
    return this.map[id];
  }

  public setPayload(payload: PurePayload) {
    this.map[payload.uuid!] = payload;
    this.setToTypedMap(payload);
  }

  public deletePayload(payload: PurePayload) {
    delete this.map[payload.uuid!];
    this.deleteFromTypedMap(payload);
  }

  public toImmutableCollection() {
    return new PayloadCollection(this.getAllPayloads());
  }
}
