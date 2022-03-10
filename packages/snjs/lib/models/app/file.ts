import { ContentType } from '@standardnotes/common'
import { SNNote } from './note'
import { SodiumConstant } from '@standardnotes/sncrypto-common'
import { ItemMutator, SNItem } from '@Models/core/item'
import {
  ContenteReferenceType,
  PayloadContent,
  PurePayload,
  FileToNoteReference,
} from '@standardnotes/payloads'

export enum FileProtocolV1 {
  EncryptedChunkSizeDelta = SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_ABYTES,
  KeySize = 256,
}

export interface FileMetadata {
  name: string
  ext: string
  mimeType: string
}

export interface FileContent extends FileMetadata {
  remoteIdentifier: string
  name: string
  key: string
  ext: string
  size: number
  encryptionHeader: string
  chunkSizes: number[]
  mimeType: string
}

type ExtendedFileContent = FileContent & PayloadContent

export class SNFile extends SNItem implements ExtendedFileContent, FileMetadata {
  public readonly remoteIdentifier: string
  public readonly name: string
  public readonly key: string
  public readonly ext: string
  public readonly size: number
  public readonly encryptionHeader: string
  public readonly chunkSizes: number[]
  public readonly mimeType: string

  constructor(payload: PurePayload) {
    super(payload)
    this.remoteIdentifier = this.typedContent.remoteIdentifier
    this.name = this.typedContent.name
    this.key = this.typedContent.key
    this.ext = this.typedContent.ext
    this.size = this.typedContent.size
    this.encryptionHeader = this.typedContent.encryptionHeader
    this.chunkSizes = this.typedContent.chunkSizes
    this.mimeType = this.typedContent.mimeType
  }

  public get nameWithExt(): string {
    return `${this.name}${this.ext && this.ext.length > 0 ? `.${this.ext}` : ''}`
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

  set ext(newExt: string | undefined) {
    this.typedContent.ext = newExt
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
