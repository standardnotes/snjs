import { SodiumConstant } from '@standardnotes/sncrypto-common'
import { ItemMutator, SNItem } from '@Models/core/item'
import { PayloadContent, PurePayload } from '@standardnotes/payloads'

export enum FileProtocolV1 {
  EncryptedChunkSizeDelta = SodiumConstant.CRYPTO_SECRETSTREAM_XCHACHA20POLY1305_ABYTES,
  KeySize = 256,
}

export interface FileContent {
  remoteIdentifier: string
  name: string
  key: string
  ext: string
  size: number
  encryptionHeader: string
  chunkSizes: number[]
}

type ExtendedFileContent = FileContent & PayloadContent

export class SNFile extends SNItem implements ExtendedFileContent {
  public readonly remoteIdentifier: string
  public readonly name: string
  public readonly key: string
  public readonly ext: string
  public readonly size: number
  public readonly encryptionHeader: string
  public readonly chunkSizes: number[]

  constructor(payload: PurePayload) {
    super(payload)
    this.remoteIdentifier = this.typedContent.remoteIdentifier
    this.name = this.typedContent.name
    this.key = this.typedContent.key
    this.ext = this.typedContent.ext
    this.size = this.typedContent.size
    this.encryptionHeader = this.typedContent.encryptionHeader
    this.chunkSizes = this.typedContent.chunkSizes
  }

  public get nameWithExt(): string {
    return `${this.name}.${this.ext}`
  }

  private get typedContent(): FileContent {
    return this.safeContent as unknown as FileContent
  }
}

export class FileMutator extends ItemMutator {
  get typedContent(): Partial<FileContent> {
    return this.content as Partial<FileContent>
  }

  set encryptionHeader(encryptionHeader: string) {
    this.typedContent.encryptionHeader = encryptionHeader
  }
}
