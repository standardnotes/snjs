import { ContentType } from '@standardnotes/common'
import { SNNote } from '../Note/Note'
import { ItemMutator } from '@Lib/models/Item/ItemMutator'
import { ContenteReferenceType, FileToNoteReference } from '@standardnotes/payloads'
import { ExtendedFileContent } from './File'

export class FileMutator extends ItemMutator {
  get typedContent(): Partial<ExtendedFileContent> {
    return this.content as Partial<ExtendedFileContent>
  }

  set name(newName: string) {
    this.typedContent.name = newName
  }

  set encryptionHeader(encryptionHeader: string) {
    this.typedContent.encryptionHeader = encryptionHeader
  }

  public associateWithNote(note: SNNote): void {
    const reference: FileToNoteReference = {
      reference_type: ContenteReferenceType.FileToNote,
      content_type: ContentType.Note,
      uuid: note.uuid,
    }

    const references = this.typedContent.references || []
    references.push(reference)
    this.typedContent.references = references
  }

  public disassociateWithNote(note: SNNote): void {
    const references = this.item.references.filter((ref) => ref.uuid !== note.uuid)
    this.typedContent.references = references
  }
}
