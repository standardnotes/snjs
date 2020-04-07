import { SNItem, ItemMutator } from '@Models/core/item';
import { PurePayload } from './../../protocol/payloads/pure_payload';

export interface NoteContent {
  title: string
  text: string
}

/** A note item */
export class SNNote extends SNItem implements NoteContent {

  public readonly title!: string
  /* Some external editors can't handle a null value for text.
  * Notes created on mobile with no text have a null value for it,
  * so we'll just set a default here. */
  public readonly text: string = ''
  public readonly mobilePrefersPlainEditor: boolean

  constructor(
    payload: PurePayload
  ) {
    super(payload);
    this.title = this.payload.safeContent.title;
    this.text = this.payload.safeContent.text;
    this.mobilePrefersPlainEditor = this.payload.safeContent.mobilePrefersPlainEditor;
  }

  safeText() {
    return this.text || '';
  }

  safeTitle() {
    return this.title || '';
  }

  static filterDummyNotes(notes: SNNote[]) {
    return notes.filter((note) => {
      return !note.dummy;
    });
  }
}

export class NoteMutator extends ItemMutator {
  set title(title: string) {
    this.content!.title = title;
  }

  set text(text: string) {
    this.content!.text = text;
  }
}