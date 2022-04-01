import { AppDataField } from '../Item/AppDataField'
import { ItemMutator } from '../Item/ItemMutator'
import { NoteContent } from './Note'

export class NoteMutator extends ItemMutator<NoteContent> {
  set title(title: string) {
    this.sureContent.title = title
  }

  set text(text: string) {
    this.sureContent.text = text
  }

  set hidePreview(hidePreview: boolean) {
    this.sureContent.hidePreview = hidePreview
  }

  set preview_plain(preview_plain: string) {
    this.sureContent.preview_plain = preview_plain
  }

  set preview_html(preview_html: string | undefined) {
    this.sureContent.preview_html = preview_html
  }

  set prefersPlainEditor(prefersPlainEditor: boolean) {
    this.setAppDataItem(AppDataField.PrefersPlainEditor, prefersPlainEditor)
  }

  set spellcheck(spellcheck: boolean) {
    this.sureContent.spellcheck = spellcheck
  }

  toggleSpellcheck(): void {
    if (this.sureContent.spellcheck == undefined) {
      this.sureContent.spellcheck = false
    } else {
      this.sureContent.spellcheck = !this.sureContent.spellcheck
    }
  }
}
