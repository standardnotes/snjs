import { ItemMutator, SNItem } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import { PurePayload } from './../../protocol/payloads/pure_payload';

export interface FileContent extends PayloadContent {
  remoteIdentifier: string;
  name: string;
  key: string;
  ext: string;
  size: number;
  encryptionHeader: string;
  chunkSize: number;
}

export class SNFile extends SNItem implements FileContent {
  public readonly remoteIdentifier: string;
  public readonly name: string;
  public readonly key: string;
  public readonly ext: string;
  public readonly size: number;
  public readonly encryptionHeader: string;
  public readonly chunkSize: number;

  constructor(payload: PurePayload) {
    super(payload);
    this.remoteIdentifier = this.typedContent.remoteIdentifier;
    this.name = this.typedContent.name;
    this.key = this.typedContent.key;
    this.ext = this.typedContent.ext;
    this.size = this.typedContent.size;
    this.encryptionHeader = this.typedContent.encryptionHeader;
    this.chunkSize = this.typedContent.chunkSize;
  }

  private get typedContent(): FileContent {
    return this.safeContent as FileContent;
  }
}

export class FileMutator extends ItemMutator {
  get typedContent(): Partial<FileContent> {
    return this.content as Partial<FileContent>;
  }

  set encryptionHeader(encryptionHeader: string) {
    this.typedContent.encryptionHeader = encryptionHeader;
  }
}
