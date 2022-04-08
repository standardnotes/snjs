import { DecryptedItem } from '../../Abstract/Item/Implementations/DecryptedItem'
import { ItemContent } from '../../Abstract/Content/ItemContent'
import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
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
  extends DecryptedItem<FileContent>
  implements FileContentSpecialized, FileProtocolV1, FileMetadata
{
  public readonly remoteIdentifier: string
  public readonly name: string
  public readonly key: string
  public readonly size: number
  public readonly encryptionHeader: string
  public readonly chunkSizes: number[]
  public readonly mimeType: string

  constructor(payload: DecryptedPayloadInterface<FileContent>) {
    super(payload)
    this.remoteIdentifier = this.content.remoteIdentifier
    this.name = this.content.name
    this.key = this.content.key
    this.size = this.content.size
    this.encryptionHeader = this.content.encryptionHeader
    this.chunkSizes = this.content.chunkSizes
    this.mimeType = this.content.mimeType
  }
}
