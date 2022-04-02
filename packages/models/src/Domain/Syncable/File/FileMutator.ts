import { ContentType } from '@standardnotes/common'
import { SNNote } from '../Note/Note'
import { FileContent } from './File'
import { FileToNoteReference } from '../../Abstract/Reference/FileToNoteReference'
import { ContenteReferenceType } from '../../Abstract/Reference/ContenteReferenceType'
import { DecryptedItemMutator } from '../../Abstract/Item/Implementations/DecryptedItemMutator'

export class FileMutator extends DecryptedItemMutator<FileContent> {
  set name(newName: string) {
    this.content.name = newName
  }

  set encryptionHeader(encryptionHeader: string) {
    this.content.encryptionHeader = encryptionHeader
  }

  public associateWithNote(note: SNNote): void {
    const reference: FileToNoteReference = {
      reference_type: ContenteReferenceType.FileToNote,
      content_type: ContentType.Note,
      uuid: note.uuid,
    }

    const references = this.content.references || []
    references.push(reference)
    this.content.references = references
  }

  public disassociateWithNote(note: SNNote): void {
    const references = this.item.references.filter((ref) => ref.uuid !== note.uuid)
    this.content.references = references
  }
}
