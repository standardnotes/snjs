import { AppDataField } from '@standardnotes/applications'
import { ItemMutator } from '@Lib/Models/Item/ItemMutator'
import { NoteContent } from './Note'

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
    if (this.typedContent.spellcheck == undefined) {
      this.typedContent.spellcheck = false
    } else {
      this.typedContent.spellcheck = !this.typedContent.spellcheck
    }
  }
}
