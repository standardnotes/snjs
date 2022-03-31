import { PurePayload } from '@standardnotes/payloads'
import { SNNote } from '.'
import { SNTag } from '../Tag'

export class NoteWithTags extends SNNote {
  constructor(payload: PurePayload, public readonly tags?: SNTag[]) {
    super(payload)
    this.tags = tags || payload.safeContent.tags
  }

  get tagsCount(): number {
    return this.tags?.length || 0
  }
}