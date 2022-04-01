import { SNItem } from '../../Abstract/Item/Item'
import { ItemContent } from '../../Abstract/Item/ItemContent'
import { PayloadInterface } from '../../Abstract/Payload/PayloadInterface'
import { FileMetadata } from './FileMetadata'
import { FileProtocolV1 } from './FileProtocolV1'

export interface FileContentSpecialized extends FileMetadata {
  remoteIdentifier: string
  name: string
  key: string
  size: number
  encryptionHeader: string
  chunkSizes: number[]
  mimeType: string
}

export type FileContent = FileContentSpecialized & ItemContent

export class SNFile
  extends SNItem<FileContent>
  implements FileContentSpecialized, FileProtocolV1, FileMetadata
{
  public readonly remoteIdentifier: string
  public readonly name: string
  public readonly key: string
  public readonly size: number
  public readonly encryptionHeader: string
  public readonly chunkSizes: number[]
  public readonly mimeType: string

  constructor(payload: PayloadInterface<FileContent>) {
    super(payload)
    this.remoteIdentifier = this.typedContent.remoteIdentifier
    this.name = this.typedContent.name
    this.key = this.typedContent.key
    this.size = this.typedContent.size
    this.encryptionHeader = this.typedContent.encryptionHeader
    this.chunkSizes = this.typedContent.chunkSizes
    this.mimeType = this.typedContent.mimeType
  }

  private get typedContent(): FileContentSpecialized {
    return this.safeContent as unknown as FileContentSpecialized
  }
}
