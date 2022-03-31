import { SNItem } from '../Item/Item'
import { PayloadContent, PurePayload } from '@standardnotes/payloads'

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

export type ExtendedFileContent = FileContent & PayloadContent

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
