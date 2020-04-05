import { SNItem } from './../../models/core/item';
import remove from 'lodash/remove';
import { ContentType } from '@Models/content_types';
import { PayloadCollection } from '@Payloads/collection';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';

type Payloadable = PurePayload | SNItem

export class MutableCollection<T extends Payloadable> {

  private readonly map: Partial<Record<UuidString, T>> = {}
  private readonly typedMap: Partial<Record<ContentType, T[]>> = {}

  constructor(elements: T[] = []) {
    for (const element of elements) {
      this.map[element.uuid!] = element;
      this.setToTypedMap(element);
    }
  }

  public getAll(contentType?: ContentType) {
    if (contentType) {
      return this.typedMap[contentType] || [];
    } else {
      return Object.keys(this.map).map((uuid: UuidString) => {
        return this.map[uuid]!;
      }) as T[];
    }
  }

  public find(id: UuidString) {
    return this.map[id];
  }

  /**
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  public findAll(uuids: UuidString[], includeBlanks = false) {
    const results = [];
    for (const id of uuids) {
      const element = this.map[id];
      if (element || includeBlanks) {
        results.push(element);
      }
    }
    return results;
  }

  public set(elements: T | T[]) {
    elements = Array.isArray(elements) ? elements : [elements];
    for (const element of elements) {
      this.map[element.uuid!] = element;
      this.setToTypedMap(element);
    }
  }

  public delete(elements: T | T[]) {
    elements = Array.isArray(elements) ? elements : [elements];
    for (const element of elements) {
      delete this.map[element.uuid!];
      this.deleteFromTypedMap(element);
    }
  }

  public toImmutablePayloadCollection() {
    return new PayloadCollection(this.getAll() as PurePayload[]);
  }

  private setToTypedMap(element: T) {
    const array = this.typedMap[element.content_type!] || [] as T[];
    remove(array, { uuid: element.uuid! as any });
    array.push(element);
    this.typedMap[element.content_type!] = array;
  }

  private deleteFromTypedMap(element: T) {
    const array = this.typedMap[element.content_type!] || [] as T[];
    remove(array, { uuid: element.uuid! as any });
    this.typedMap[element.content_type!] = array;
  }

}
