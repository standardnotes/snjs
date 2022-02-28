import {
  ContenteReferenceType,
  ContentReference,
  isTagToParentTagReference,
  TagToParentTagReference,
  PurePayload,
  ItemInterface,
} from '@standardnotes/payloads'
import { ItemMutator, SNItem } from '@Models/core/item'
import { ContentType } from '@standardnotes/common'
import { UuidString } from './../../types'
import { ItemContent } from './../core/item'

export const TagFolderDelimitter = '.'

export interface TagContent extends ItemContent {
  title: string;
  expanded: boolean;
}

export const isTag = (x: ItemInterface): x is SNTag =>
  x.content_type === ContentType.Tag

/**
 * Allows organization of notes into groups.
 * A tag can have many notes, and a note can have many tags.
 */
export class SNTag extends SNItem implements TagContent {
  public readonly title: string
  /** Whether to render child tags in view hierarchy. Opposite of collapsed. */
  public readonly expanded: boolean

  constructor(payload: PurePayload) {
    super(payload)
    this.title = this.payload.safeContent.title || ''
    this.expanded =
      this.payload.safeContent.expanded != undefined
        ? this.payload.safeContent.expanded
        : true
  }

  get noteReferences(): ContentReference[] {
    const references = this.payload.safeReferences
    return references.filter((ref) => ref.content_type === ContentType.Note)
  }

  get noteCount(): number {
    return this.noteReferences.length
  }

  public get parentId(): UuidString | undefined {
    const reference = this.references.find(isTagToParentTagReference)
    return reference?.uuid
  }

  public static arrayToDisplayString(tags: SNTag[]): string {
    return tags
      .sort((a, b) => {
        return a.title > b.title ? 1 : -1
      })
      .map((tag) => {
        return '#' + tag.title
      })
      .join(' ')
  }
}

export class TagMutator extends ItemMutator {
  get typedContent(): TagContent {
    return this.content as TagContent
  }

  set title(title: string) {
    this.typedContent.title = title
  }

  set expanded(expanded: boolean) {
    this.typedContent.expanded = expanded
  }

  public makeChildOf(tag: SNTag): void {
    const references = this.item.references.filter(
      (ref) => !isTagToParentTagReference(ref)
    )

    const reference: TagToParentTagReference = {
      reference_type: ContenteReferenceType.TagToParentTag,
      content_type: ContentType.Tag,
      uuid: tag.uuid,
    }

    references.push(reference)

    this.typedContent.references = references
  }

  public unsetParent(): void {
    const references = this.item.references.filter(
      (ref) => !isTagToParentTagReference(ref)
    )
    this.typedContent.references = references
  }
}
