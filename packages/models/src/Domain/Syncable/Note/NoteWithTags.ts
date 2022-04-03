import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
import { SNTag } from '../Tag'
import { NoteContent, SNNote } from './Note'

interface NoteWithTagsContent extends NoteContent {
  tags: SNTag[]
}

export class NoteWithTags extends SNNote {
  constructor(
    payload: DecryptedPayloadInterface<NoteWithTagsContent>,
    public readonly tags?: SNTag[],
  ) {
    super(payload)
    this.tags = tags || payload.content.tags
  }

  static Create(payload: DecryptedPayloadInterface<NoteContent>, tags?: SNTag[]) {
    return new NoteWithTags(payload as DecryptedPayloadInterface<NoteWithTagsContent>, tags)
  }

  get tagsCount(): number {
    return this.tags?.length || 0
  }
}
