import { ItemContent } from '../../Abstract/Content/ItemContent'

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
