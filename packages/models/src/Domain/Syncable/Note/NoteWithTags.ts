import { PayloadInterface } from '../../Abstract/Payload/Interfaces/PayloadInterface'
import { SNTag } from '../Tag'
import { NoteContent, SNNote } from './Note'

interface NoteWithTagsContent extends NoteContent {
  tags: SNTag[]
}

export class NoteWithTags extends SNNote {
  constructor(payload: DecryptedPayloadInterface<NoteWithTagsContent>, public readonly tags?: SNTag[]) {
    super(payload)
    this.tags = tags || payload.content.tags
  }

  static Create(payload: PayloadInterface<NoteContent>, tags?: SNTag[]) {
    return new NoteWithTags(payload as PayloadInterface<NoteWithTagsContent>, tags)
  }

  get tagsCount(): number {
    return this.tags?.length || 0
  }
}
