import { isNullOrUndefined } from '@Lib/utils';
import { SNItem, ItemMutator, AppDataField } from '@Models/core/item';
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
  public readonly mobilePrefersPlainEditor?: boolean
  public readonly hidePreview = false
  public readonly preview_plain!: string
  public readonly preview_html!: string

  constructor(
    payload: PurePayload
  ) {
    super(payload);
    this.title = this.payload.safeContent.title;
    this.text = this.payload.safeContent.text;
    this.preview_plain = this.payload.safeContent.preview_plain;
    this.preview_html = this.payload.safeContent.preview_html;
    this.hidePreview = this.payload.safeContent.hidePreview;
    if (!isNullOrUndefined(this.payload.safeContent.mobilePrefersPlainEditor)) {
      this.mobilePrefersPlainEditor = this.payload.safeContent.mobilePrefersPlainEditor;
    }
  }

  safeText() {
    return this.text || '';
  }

  safeTitle() {
    return this.title || '';
  }

  get prefersPlainEditor() {
    return this.getAppDomainValue(AppDataField.PrefersPlainEditor);
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

  set hidePreview(hidePreview: boolean) {
    this.content!.hidePreview = hidePreview;
  }

  set preview_plain(preview_plain: string) {
    this.content!.preview_plain = preview_plain;
  }

  set preview_html(preview_html: string | undefined) {
    this.content!.preview_html = preview_html;
  }

  set prefersPlainEditor(prefersPlainEditor: boolean) {
    this.setAppDataItem(AppDataField.PrefersPlainEditor, prefersPlainEditor);
  }
}