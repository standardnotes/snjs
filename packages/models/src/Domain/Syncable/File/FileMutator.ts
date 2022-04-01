import { ContentType } from '@standardnotes/common'
import { SNNote } from '../Note/Note'
import { ItemMutator } from '../../Abstract/Item/ItemMutator'
import { FileContent } from './File'
import { FileToNoteReference } from '../../Abstract/Reference/FileToNoteReference'
import { ContenteReferenceType } from '../../Abstract/Reference/ContenteReferenceType'

export class FileMutator extends ItemMutator<FileContent> {
  set name(newName: string) {
    this.sureContent.name = newName
  }

  set encryptionHeader(encryptionHeader: string) {
    this.sureContent.encryptionHeader = encryptionHeader
  }

  public associateWithNote(note: SNNote): void {
    const reference: FileToNoteReference = {
      reference_type: ContenteReferenceType.FileToNote,
      content_type: ContentType.Note,
      uuid: note.uuid,
    }

    const references = this.sureContent.references || []
    references.push(reference)
    this.sureContent.references = references
  }

  public disassociateWithNote(note: SNNote): void {
    const references = this.item.references.filter((ref) => ref.uuid !== note.uuid)
    this.sureContent.references = references
  }
}
