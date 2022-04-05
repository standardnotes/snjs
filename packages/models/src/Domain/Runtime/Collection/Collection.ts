import { extendArray } from '@standardnotes/utils'
import { ContentType, Uuid } from '@standardnotes/common'
import { remove } from 'lodash'

export interface CollectionElement {
  uuid: Uuid
  content_type: ContentType
  dirty?: boolean
  deleted?: boolean
}

export interface DeletedCollectionElement extends CollectionElement {
  deleted: true
}

export abstract class Collection<
  Element extends CollectionElement,
  DeletedElement extends DeletedCollectionElement,
> {
  readonly map: Partial<Record<Uuid, Element | DeletedElement>> = {}
  readonly typedMap: Partial<Record<ContentType, (Element | DeletedElement)[]>> = {}

  /** An array of uuids of items that are dirty */
  dirtyIndex: Set<Uuid> = new Set()

  /** An array of uuids of items that are not marked as deleted */
  nondeletedIndex: Set<Uuid> = new Set()

  isNonDeletedElement(e: Element | DeletedElement): e is Element {
    return !this.isDeletedElement(e)
  }

  isDeletedElement(e: Element | DeletedElement): e is DeletedElement {
    return (e as DeletedCollectionElement).deleted === true
  }

  constructor(
    copy = false,
    mapCopy?: Partial<Record<Uuid, Element | DeletedElement>>,
    typedMapCopy?: Partial<Record<ContentType, (Element | DeletedElement)[]>>,
  ) {
    if (copy) {
      this.map = mapCopy!
      this.typedMap = typedMapCopy!
    }
  }

  public uuids(): Uuid[] {
    return Object.keys(this.map)
  }

  public all(contentType?: ContentType | ContentType[]): (Element | DeletedElement)[] {
    if (contentType) {
      if (Array.isArray(contentType)) {
        const elements: (Element | DeletedElement)[] = []
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
      }) as (Element | DeletedElement)[]
    }
  }

  public allNondeleted<E extends Element>(contentType?: ContentType | ContentType[]): E[] {
    const all = this.all(contentType)
    const filtered = all.filter(this.isNonDeletedElement) as E[]
    return filtered
  }

  public find(uuid: Uuid): Element | DeletedElement | undefined {
    return this.map[uuid]
  }

  public findNondeleted<E extends Element>(uuid: Uuid): E | undefined {
    const result = this.map[uuid]
    if (result && this.isNonDeletedElement(result)) {
      return result as E
    }
    return undefined
  }

  /** Returns all elements that are marked as dirty */
  public dirtyElements(): (Element | DeletedElement)[] {
    const uuids = Array.from(this.dirtyIndex)
    return this.findAll(uuids)
  }

  /** Returns all elements that are not marked as deleted */
  public nondeletedElements(): Element[] {
    const uuids = Array.from(this.nondeletedIndex)
    return this.findAll(uuids).filter(this.isNonDeletedElement)
  }

  public findAll(uuids: Uuid[]): (Element | DeletedElement)[] {
    const results: (Element | DeletedElement)[] = []

    for (const id of uuids) {
      const element = this.map[id]
      if (element) {
        results.push(element)
      }
    }

    return results
  }

  public findAllNondeleted<E extends Element>(uuids: Uuid[]): E[] {
    const results: E[] = []

    for (const id of uuids) {
      const element = this.map[id]
      if (element && this.isNonDeletedElement(element)) {
        results.push(element as E)
      }
    }

    return results
  }

  public findAllNondeletedIncludingBlanks<E extends Element>(uuids: Uuid[]): (E | undefined)[] {
    const results: (E | undefined)[] = []

    for (const id of uuids) {
      const element = this.map[id]
      if (!element || this.isDeletedElement(element)) {
        results.push(undefined)
      } else {
        results.push(element as E)
      }
    }

    return results
  }

  /**
   * If an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  public findAllIncludingBlanks<E extends Element>(
    uuids: Uuid[],
  ): (E | DeletedElement | undefined)[] {
    const results: (E | DeletedElement | undefined)[] = []

    for (const id of uuids) {
      const element = this.map[id] as E | DeletedElement | undefined
      results.push(element)
    }

    return results
  }

  public set(elements: Element | DeletedElement | (Element | DeletedElement)[]): void {
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

  public discard(elements: Element | DeletedElement | (Element | DeletedElement)[]): void {
    elements = Array.isArray(elements) ? elements : [elements]
    for (const element of elements) {
      this.deleteFromTypedMap(element)
      delete this.map[element.uuid]
    }
  }

  private setToTypedMap(element: Element | DeletedElement): void {
    const array = this.typedMap[element.content_type] || []
    remove(array, { uuid: element.uuid as never })
    array.push(element)
    this.typedMap[element.content_type] = array
  }

  private deleteFromTypedMap(element: Element | DeletedElement): void {
    const array = this.typedMap[element.content_type] || []
    remove(array, { uuid: element.uuid as never })
    this.typedMap[element.content_type] = array
  }
}
