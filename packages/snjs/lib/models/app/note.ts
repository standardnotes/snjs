import { isNullOrUndefined } from '@Lib/utils';
import { ContentType } from '@Models/content_types';
import { AppDataField, ItemMutator, SNItem } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import { PayloadFormat } from './../../protocol/payloads/formats';
import { PurePayload } from './../../protocol/payloads/pure_payload';

export interface NoteContent extends PayloadContent {
  title: string;
  text: string;
  mobilePrefersPlainEditor?: boolean;
  hidePreview: boolean;
  preview_plain?: string;
  preview_html?: string;
  spellcheck?: boolean;
}

export const isNote = (x: SNItem): x is SNNote =>
  x.content_type === ContentType.Note;

/** A note item */
export class SNNote extends SNItem implements NoteContent {
  public readonly title!: string;
  /* Some external editors can't handle a null value for text.
   * Notes created on mobile with no text have a null value for it,
   * so we'll just set a default here. */
  public readonly text: string = '';
  public readonly mobilePrefersPlainEditor?: boolean;
  public readonly hidePreview = false;
  public readonly preview_plain!: string;
  public readonly preview_html!: string;
  public readonly prefersPlainEditor!: boolean;
  public readonly spellcheck?: boolean | undefined;

  constructor(payload: PurePayload) {
    super(payload);
    this.title = this.payload.safeContent.title;
    this.text = this.payload.safeContent.text;
    this.preview_plain = this.payload.safeContent.preview_plain;
    this.preview_html = this.payload.safeContent.preview_html;
    this.hidePreview = this.payload.safeContent.hidePreview;
    this.spellcheck = this.payload.safeContent.spellcheck;

    if (payload.format === PayloadFormat.DecryptedBareObject) {
      this.prefersPlainEditor = this.getAppDomainValue(
        AppDataField.PrefersPlainEditor
      );
    }
    if (!isNullOrUndefined(this.payload.safeContent.mobilePrefersPlainEditor)) {
      this.mobilePrefersPlainEditor = this.payload.safeContent.mobilePrefersPlainEditor;
    }
  }

  safeText(): string {
    return this.text || '';
  }

  safeTitle(): string {
    return this.title || '';
  }
}

export class NoteMutator extends ItemMutator {
  get typedContent(): Partial<NoteContent> {
    return this.content as Partial<NoteContent>;
  }

  set title(title: string) {
    this.typedContent.title = title;
  }

  set text(text: string) {
    this.typedContent.text = text;
  }

  set hidePreview(hidePreview: boolean) {
    this.typedContent.hidePreview = hidePreview;
  }

  set preview_plain(preview_plain: string) {
    this.typedContent.preview_plain = preview_plain;
  }

  set preview_html(preview_html: string | undefined) {
    this.typedContent.preview_html = preview_html;
  }

  set prefersPlainEditor(prefersPlainEditor: boolean) {
    this.setAppDataItem(AppDataField.PrefersPlainEditor, prefersPlainEditor);
  }

  set spellcheck(spellcheck: boolean) {
    this.typedContent.spellcheck = spellcheck;
  }

  toggleSpellcheck(): void {
    this.typedContent.spellcheck = !this.typedContent.spellcheck;
  }
}
