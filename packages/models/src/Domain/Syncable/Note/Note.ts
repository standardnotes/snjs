import { isNullOrUndefined } from '@standardnotes/utils'
import { ContentType } from '@standardnotes/common'
import { SNItem } from '../../Abstract/Item/Item'
import { ItemInterface } from '../../Abstract/Item/ItemInterface'
import { ItemContent } from '../../Abstract/Item/ItemContent'
import { PayloadInterface } from '../../Abstract/Payload/PayloadInterface'
import { PayloadFormat } from '../../Abstract/Payload/PayloadFormat'
import { AppDataField } from '../../Abstract/Item/AppDataField'

export interface NoteInterface {
  title: string
  text: string
  mobilePrefersPlainEditor?: boolean
  hidePreview?: boolean
  preview_plain?: string
  preview_html?: string
  spellcheck?: boolean
}

export type NoteContent = NoteInterface & ItemContent

export const isNote = (x: ItemInterface): x is SNNote => x.content_type === ContentType.Note

/** A note item */
export class SNNote extends SNItem<NoteContent> implements NoteInterface {
  public readonly title: string
  public readonly text: string
  public readonly mobilePrefersPlainEditor?: boolean
  public readonly hidePreview: boolean = false
  public readonly preview_plain: string
  public readonly preview_html: string
  public readonly prefersPlainEditor: boolean
  public readonly spellcheck?: boolean

  constructor(payload: PayloadInterface<NoteContent>) {
    super(payload)

    this.title = String(this.payload.safeContent.title || '')
    this.text = String(this.payload.safeContent.text || '')
    this.preview_plain = String(this.payload.safeContent.preview_plain || '')
    this.preview_html = String(this.payload.safeContent.preview_html || '')
    this.hidePreview = Boolean(this.payload.safeContent.hidePreview)
    this.spellcheck = this.payload.safeContent.spellcheck

    if (payload.format === PayloadFormat.DecryptedBareObject) {
      this.prefersPlainEditor = this.getAppDomainValueWithDefault(
        AppDataField.PrefersPlainEditor,
        false,
      )
    }

    if (!isNullOrUndefined(this.payload.safeContent.mobilePrefersPlainEditor)) {
      this.mobilePrefersPlainEditor = this.payload.safeContent.mobilePrefersPlainEditor
    }
  }
}
