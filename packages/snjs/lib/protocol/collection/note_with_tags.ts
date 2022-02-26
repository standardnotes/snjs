import { SNTag } from '@Lib/index';
import { SNNote } from '@Lib/models';
import { PurePayload } from '@standardnotes/payloads';

export class NoteWithTags extends SNNote {
  constructor(payload: PurePayload, public readonly tags?: SNTag[]) {
    super(payload);
    this.tags = tags || payload.safeContent.tags;
  }
}
