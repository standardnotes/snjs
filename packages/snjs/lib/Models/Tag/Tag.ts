import {
  ContentReference,
  isTagToParentTagReference,
  PurePayload,
  ItemInterface,
} from '@standardnotes/payloads'
import { ContentType } from '@standardnotes/common'
import { ItemContent, SNItem } from '../Item'
import { UuidString } from '@Lib/Types/UuidString'

export const TagFolderDelimitter = '.'

export interface TagContent extends ItemContent {
  title: string
  expanded: boolean
}

export const isTag = (x: ItemInterface): x is SNTag => x.content_type === ContentType.Tag

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
      this.payload.safeContent.expanded != undefined ? this.payload.safeContent.expanded : true
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
