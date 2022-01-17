import {
  ContenteReferenceType,
  ContentReference,
  isTagToParentTagReference,
  TagToParentTagReference,
} from '@Lib/protocol/payloads/generator';
import { ItemMutator, SNItem } from '@Models/core/item';
import { PurePayload } from '@Protocol/payloads/pure_payload';
import { ContentType } from '@standardnotes/common';
import { UuidString } from './../../types';
import { ItemContent } from './../core/item';

export interface TagContent extends ItemContent {
  title: string;
}

export const isTag = (x: SNItem): x is SNTag =>
  x.content_type === ContentType.Tag;

/**
 * Allows organization of notes into groups.
 * A tag can have many notes, and a note can have many tags.
 */
export class SNTag extends SNItem implements TagContent {
  public readonly title: string;

  constructor(payload: PurePayload) {
    super(payload);
    this.title = this.payload.safeContent.title || '';
  }

  get noteReferences(): ContentReference[] {
    const references = this.payload.safeReferences;
    return references.filter((ref) => ref.content_type === ContentType.Note);
  }

  get noteCount(): number {
    return this.noteReferences.length;
  }

  public get isSmartTag(): boolean {
    return this.content_type === ContentType.SmartTag;
  }

  public get isSystemSmartTag(): boolean {
    return this.payload.safeContent.isSystemTag;
  }

  public get isAllTag(): boolean {
    return this.payload.safeContent.isAllTag;
  }

  public get isTrashTag(): boolean {
    return this.payload.safeContent.isTrashTag;
  }

  public get isArchiveTag(): boolean {
    return this.payload.safeContent.isArchiveTag;
  }

  public get parentId(): UuidString | undefined {
    const reference = this.references.find(isTagToParentTagReference);
    return reference?.uuid;
  }

  public static arrayToDisplayString(tags: SNTag[]): string {
    return tags
      .sort((a, b) => {
        return a.title > b.title ? 1 : -1;
      })
      .map((tag) => {
        return '#' + tag.title;
      })
      .join(' ');
  }
}

export class TagMutator extends ItemMutator {
  get typedContent(): TagContent {
    return this.content as TagContent;
  }

  set title(title: string) {
    this.typedContent.title = title;
  }

  public makeChildOf(tag: SNTag): void {
    const references = this.item.references.filter(isTagToParentTagReference);

    const reference: TagToParentTagReference = {
      reference_type: ContenteReferenceType.TagToParentTag,
      content_type: ContentType.Tag,
      uuid: tag.uuid,
    };

    references.push(reference);

    this.typedContent.references = references;
  }

  public unsetParent(): void {
    const references = this.item.references.filter(ref => !isTagToParentTagReference(ref));
    this.typedContent.references = references;
  }
}
