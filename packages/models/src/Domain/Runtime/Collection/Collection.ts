import { extendArray } from '@standardnotes/utils'
import { ContentType, Uuid } from '@standardnotes/common'
import { remove } from 'lodash'

export interface CollectionElement {
  uuid: Uuid
  content_type: ContentType
  dirty?: boolean
  deleted?: boolean
}

export interface DiscardableCollectionElement extends CollectionElement {
  deleted: true
}

export abstract class Collection<
  E extends CollectionElement,
  D extends DiscardableCollectionElement,
> {
  readonly map: Partial<Record<Uuid, E>> = {}
  readonly typedMap: Partial<Record<ContentType, E[]>> = {}

  /** An array of uuids of items that are dirty */
  dirtyIndex: Set<Uuid> = new Set()

  /** An array of uuids of items that are not marked as deleted */
  nondeletedIndex: Set<Uuid> = new Set()

  constructor(
    copy = false,
    mapCopy?: Partial<Record<Uuid, E>>,
    typedMapCopy?: Partial<Record<ContentType, E[]>>,
  ) {
    if (copy) {
      this.map = mapCopy!
      this.typedMap = typedMapCopy!
    }
  }

  public uuids(): Uuid[] {
    return Object.keys(this.map)
  }

  public all(contentType?: ContentType | ContentType[]): E[] {
    if (contentType) {
      if (Array.isArray(contentType)) {
        const elements: E[] = []
        for (const type of contentType) {
          extendArray(elements, this.typedMap[type] || [])
        }
        return elements
      } else {
        return this.typedMap[contentType]?.slice() || []
      }
    } else {
      return Object.keys(this.map).map((uuid: Uuid) => {
        return this.map[uuid]
      }) as E[]
    }
  }

  public find(uuid: Uuid): E | undefined {
    return this.map[uuid]
  }

  /** Returns all elements that are marked as dirty */
  public dirtyElements(): E[] {
    const uuids = Array.from(this.dirtyIndex)
    return this.findAll(uuids)
  }

  /** Returns all elements that are not marked as deleted */
  public nondeletedElements(): E[] {
    const uuids = Array.from(this.nondeletedIndex)
    return this.findAll(uuids)
  }

  public findAll(uuids: Uuid[]): E[] {
    const results: E[] = []

    for (const id of uuids) {
      const element = this.map[id]
      if (element) {
        results.push(element)
      }
    }

    return results
  }

  /**
   * If an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  public findAllIncludingBlanks(uuids: Uuid[]): (E | undefined)[] {
    const results: (E | undefined)[] = []

    for (const id of uuids) {
      const element = this.map[id]
      results.push(element)
    }

    return results
  }

  public set(elements: E | E[]): void {
    elements = Array.isArray(elements) ? elements : [elements]

    if (elements.length === 0) {
      console.warn('Attempting to set 0 elements onto collection')
      return
    }

    for (const element of elements) {
      this.map[element.uuid] = element
      this.setToTypedMap(element)

      if (element.dirty) {
        this.dirtyIndex.add(element.uuid)
      } else {
        this.dirtyIndex.delete(element.uuid)
      }

      if (element.deleted) {
        this.nondeletedIndex.delete(element.uuid)
      } else {
        this.nondeletedIndex.add(element.uuid)
      }
    }
  }

  public discard(elements: (E | D) | (E | D)[]): void {
    elements = Array.isArray(elements) ? elements : [elements]
    for (const element of elements) {
      this.deleteFromTypedMap(element)
      delete this.map[element.uuid]
    }
  }

  private setToTypedMap(element: E): void {
    const array = this.typedMap[element.content_type] || []
    remove(array, { uuid: element.uuid as never })
    array.push(element)
    this.typedMap[element.content_type] = array
  }

  private deleteFromTypedMap(element: E | D): void {
    const array = this.typedMap[element.content_type] || []
    remove(array, { uuid: element.uuid as never })
    this.typedMap[element.content_type] = array
  }
}
