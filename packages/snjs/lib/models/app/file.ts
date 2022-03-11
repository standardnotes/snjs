import { ContentType } from '@standardnotes/common'
import { SNNote } from './note'
import { ItemMutator, SNItem } from '@Models/core/item'
import {
  ContenteReferenceType,
  PayloadContent,
  PurePayload,
  FileToNoteReference,
} from '@standardnotes/payloads'

export enum FileProtocolV1Constants {
  KeySize = 256,
}

interface FileProtocolV1 {
  readonly encryptionHeader: string
  readonly key: string
  readonly remoteIdentifier: string
}

export interface FileMetadata {
  name: string
  mimeType: string
}

export interface FileContent extends FileMetadata {
  remoteIdentifier: string
  name: string
  key: string
  size: number
  encryptionHeader: string
  chunkSizes: number[]
  mimeType: string
}

type ExtendedFileContent = FileContent & PayloadContent

export class SNFile extends SNItem implements ExtendedFileContent, FileProtocolV1, FileMetadata {
  public readonly remoteIdentifier: string
  public readonly name: string
  public readonly key: string
  public readonly size: number
  public readonly encryptionHeader: string
  public readonly chunkSizes: number[]
  public readonly mimeType: string

  constructor(payload: PurePayload) {
    super(payload)
    this.remoteIdentifier = this.typedContent.remoteIdentifier
    this.name = this.typedContent.name
    this.key = this.typedContent.key
    this.size = this.typedContent.size
    this.encryptionHeader = this.typedContent.encryptionHeader
    this.chunkSizes = this.typedContent.chunkSizes
    this.mimeType = this.typedContent.mimeType
  }

  private get typedContent(): FileContent {
    return this.safeContent as unknown as FileContent
  }
}

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
