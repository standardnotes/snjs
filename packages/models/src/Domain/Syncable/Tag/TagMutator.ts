import { ContentType } from '@standardnotes/common'
import { TagContent, SNTag } from './Tag'
import { isTagToParentTagReference } from '../../Abstract/Reference/Functions'
import { TagToParentTagReference } from '../../Abstract/Reference/TagToParentTagReference'
import { ContenteReferenceType } from '../../Abstract/Reference/ContenteReferenceType'
import { DecryptedItemMutator } from '../../Abstract/Item/Implementations/DecryptedItemMutator'

export class TagMutator extends DecryptedItemMutator<TagContent> {
  set title(title: string) {
    this.content.title = title
  }

  set expanded(expanded: boolean) {
    this.content.expanded = expanded
  }

  public makeChildOf(tag: SNTag): void {
    const references = this.item.references.filter((ref) => !isTagToParentTagReference(ref))

    const reference: TagToParentTagReference = {
      reference_type: ContenteReferenceType.TagToParentTag,
      content_type: ContentType.Tag,
      uuid: tag.uuid,
    }

    references.push(reference)

    this.content.references = references
  }

  public unsetParent(): void {
    const references = this.item.references.filter((ref) => !isTagToParentTagReference(ref))
    this.content.references = references
  }
}
