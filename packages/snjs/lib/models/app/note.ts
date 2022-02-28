import { isNullOrUndefined } from '@standardnotes/utils'
import { ContentType } from '@standardnotes/common'
import { AppDataField } from '@standardnotes/applications'
import { ItemMutator, SNItem } from '@Models/core/item'
import { ItemInterface, PayloadContent, PayloadFormat, PurePayload } from '@standardnotes/payloads'

export interface NoteContent extends PayloadContent {
  title: string
  text: string
  mobilePrefersPlainEditor?: boolean
  hidePreview: boolean
  preview_plain?: string
  preview_html?: string
  spellcheck?: boolean
}

export const isNote = (x: ItemInterface): x is SNNote => x.content_type === ContentType.Note

/** A note item */
export class SNNote extends SNItem implements NoteContent {
  public readonly title: string
  public readonly text: string
  public readonly mobilePrefersPlainEditor?: boolean
  public readonly hidePreview: boolean = false
  public readonly preview_plain: string
  public readonly preview_html: string
  public readonly prefersPlainEditor!: boolean
  public readonly spellcheck?: boolean

  constructor(payload: PurePayload) {
    super(payload)

    this.title = String(this.payload.safeContent.title || '')
    this.text = String(this.payload.safeContent.text || '')
    this.preview_plain = String(this.payload.safeContent.preview_plain || '')
    this.preview_html = String(this.payload.safeContent.preview_html || '')
    this.hidePreview = Boolean(this.payload.safeContent.hidePreview)
    this.spellcheck = this.payload.safeContent.spellcheck

    if (payload.format === PayloadFormat.DecryptedBareObject) {
      this.prefersPlainEditor = this.getAppDomainValue(AppDataField.PrefersPlainEditor)
    }

    if (!isNullOrUndefined(this.payload.safeContent.mobilePrefersPlainEditor)) {
      this.mobilePrefersPlainEditor = this.payload.safeContent.mobilePrefersPlainEditor
    }
  }
}

export class NoteMutator extends ItemMutator {
  get typedContent(): Partial<NoteContent> {
    return this.content as Partial<NoteContent>
  }

  set title(title: string) {
    this.typedContent.title = title
  }

  set text(text: string) {
    this.typedContent.text = text
  }

  set hidePreview(hidePreview: boolean) {
    this.typedContent.hidePreview = hidePreview
  }

  set preview_plain(preview_plain: string) {
    this.typedContent.preview_plain = preview_plain
  }

  set preview_html(preview_html: string | undefined) {
    this.typedContent.preview_html = preview_html
  }

  set prefersPlainEditor(prefersPlainEditor: boolean) {
    this.setAppDataItem(AppDataField.PrefersPlainEditor, prefersPlainEditor)
  }

  set spellcheck(spellcheck: boolean) {
    this.typedContent.spellcheck = spellcheck
  }

  toggleSpellcheck(): void {
    this.typedContent.spellcheck = !this.typedContent.spellcheck
  }
}
