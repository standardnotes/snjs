import { ItemContent } from '../../../Abstract/Content/ItemContent'
import { DecryptedItem } from '../../../Abstract/Item'
import { DecryptedPayloadInterface } from '../../../Abstract/Payload/Interfaces/DecryptedPayload'
import { SNTag } from '../../../Syncable/Tag'

interface ItemWithTagsContent extends ItemContent {
  tags: SNTag[]
}

export class ItemWithTags extends DecryptedItem {
  constructor(payload: DecryptedPayloadInterface<ItemWithTagsContent>, public readonly tags?: SNTag[]) {
    super(payload)
    this.tags = tags || payload.content.tags
  }

  static Create(payload: DecryptedPayloadInterface<ItemContent>, tags?: SNTag[]) {
    return new ItemWithTags(payload as DecryptedPayloadInterface<ItemWithTagsContent>, tags)
  }

  get tagsCount(): number {
    return this.tags?.length || 0
  }
}
