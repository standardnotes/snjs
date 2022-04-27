import { DecryptedItem } from '../../Abstract/Item/Implementations/DecryptedItem'
import { ItemContent } from '../../Abstract/Content/ItemContent'
import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
import { FileMetadata } from './FileMetadata'
import { FileProtocolV1 } from './FileProtocolV1'

interface SizesDeprecatedDueToAmbiguousNaming {
  /** Decrypted size in bytes */
  size?: number
  /** Encrypted chunk sizes */
  chunkSizes?: number[]
}

interface Sizes {
  decryptedSize: number
  encryptedChunkSizes: number[]
}

interface FileContentWithoutSize {
  remoteIdentifier: string
  name: string
  key: string
  encryptionHeader: string
  mimeType: string
}

type FileContentSpecialized = FileContentWithoutSize & FileMetadata & SizesDeprecatedDueToAmbiguousNaming & Sizes

export type FileContent = FileContentSpecialized & ItemContent

export class SNFile
  extends DecryptedItem<FileContent>
  implements FileContentWithoutSize, Sizes, FileProtocolV1, FileMetadata
{
  public readonly remoteIdentifier: string
  public readonly name: string
  public readonly key: string
  public readonly encryptionHeader: string
  public readonly mimeType: string

  public readonly decryptedSize: number
  public readonly encryptedChunkSizes: number[]

  constructor(payload: DecryptedPayloadInterface<FileContent>) {
    super(payload)
    this.remoteIdentifier = this.content.remoteIdentifier
    this.name = this.content.name
    this.key = this.content.key

    if (this.content.size && this.content.chunkSizes) {
      this.decryptedSize = this.content.size
      this.encryptedChunkSizes = this.content.chunkSizes
    } else {
      this.decryptedSize = this.content.decryptedSize
      this.encryptedChunkSizes = this.content.encryptedChunkSizes
    }

    this.encryptionHeader = this.content.encryptionHeader
    this.mimeType = this.content.mimeType
  }

  public get encryptedSize(): number {
    return this.encryptedChunkSizes.reduce((total, chunk) => total + chunk, 0)
  }
}
