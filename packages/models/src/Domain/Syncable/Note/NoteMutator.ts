import { AppDataField } from '../../Abstract/Item/Types/AppDataField'
import { NoteContent } from './Note'
import { DecryptedItemMutator } from '../../Abstract/Item/Mutator/DecryptedItemMutator'

export class NoteMutator extends DecryptedItemMutator<NoteContent> {
  set title(title: string) {
    this.content.title = title
  }

  set text(text: string) {
    this.content.text = text
  }

  set hidePreview(hidePreview: boolean) {
    this.content.hidePreview = hidePreview
  }

  set preview_plain(preview_plain: string) {
    this.content.preview_plain = preview_plain
  }

  set preview_html(preview_html: string | undefined) {
    this.content.preview_html = preview_html
  }

  set prefersPlainEditor(prefersPlainEditor: boolean) {
    this.setAppDataItem(AppDataField.PrefersPlainEditor, prefersPlainEditor)
  }

  set spellcheck(spellcheck: boolean) {
    this.content.spellcheck = spellcheck
  }

  toggleSpellcheck(): void {
    if (this.content.spellcheck == undefined) {
      this.content.spellcheck = false
    } else {
      this.content.spellcheck = !this.content.spellcheck
    }
  }
}
