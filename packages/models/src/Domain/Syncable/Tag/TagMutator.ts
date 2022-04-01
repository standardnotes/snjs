import { ItemMutator } from '../../Abstract/Item/ItemMutator'
import { ContentType } from '@standardnotes/common'
import { TagContent, SNTag } from './Tag'
import { isTagToParentTagReference } from '../../Abstract/Reference/Functions'
import { TagToParentTagReference } from '../../Abstract/Reference/TagToParentTagReference'
import { ContenteReferenceType } from '../../Abstract/Reference/ContenteReferenceType'

export class TagMutator extends ItemMutator<TagContent> {
  set title(title: string) {
    this.sureContent.title = title
  }

  set expanded(expanded: boolean) {
    this.sureContent.expanded = expanded
  }

  public makeChildOf(tag: SNTag): void {
    const references = this.item.references.filter((ref) => !isTagToParentTagReference(ref))

    const reference: TagToParentTagReference = {
      reference_type: ContenteReferenceType.TagToParentTag,
      content_type: ContentType.Tag,
      uuid: tag.uuid,
    }

    references.push(reference)

    this.sureContent.references = references
  }

  public unsetParent(): void {
    const references = this.item.references.filter((ref) => !isTagToParentTagReference(ref))
    this.sureContent.references = references
  }
}
