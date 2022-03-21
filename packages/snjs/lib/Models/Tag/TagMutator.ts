import {
  ContenteReferenceType,
  isTagToParentTagReference,
  TagToParentTagReference,
} from '@standardnotes/payloads'
import { ItemMutator } from '@Lib/Models/Item/ItemMutator'
import { ContentType } from '@standardnotes/common'
import { TagContent, SNTag } from './Tag'

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
    const references = this.item.references.filter((ref) => !isTagToParentTagReference(ref))

    const reference: TagToParentTagReference = {
      reference_type: ContenteReferenceType.TagToParentTag,
      content_type: ContentType.Tag,
      uuid: tag.uuid,
    }

    references.push(reference)

    this.typedContent.references = references
  }

  public unsetParent(): void {
    const references = this.item.references.filter((ref) => !isTagToParentTagReference(ref))
    this.typedContent.references = references
  }
}
