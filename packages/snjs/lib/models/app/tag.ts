import { UuidString } from './../../types';
import { ItemContent } from './../core/item';
import { ItemMutator, SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { PurePayload } from '@Protocol/payloads/pure_payload';

export interface TagContent extends ItemContent {
  title: string;
}

/**
 * Allows organization of notes into groups.
 * A tag can have many notes, and a note can have many tags.
 */
export class SNTag extends SNItem implements TagContent {
  public readonly title: string;

  constructor(payload: PurePayload) {
    super(payload);
    this.title = this.payload.safeContent.title;
  }

  get noteCount(): number {
    return this.payload.safeReferences.length;
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
    const reference = this.payload.safeContent.references.find(
      (ref) => ref.content_type === ContentType.Tag
    );
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
    const references = this.typedContent.references.filter(
      (ref) => ref.content_type !== ContentType.Tag
    );
    references.push({
      content_type: ContentType.Tag,
      uuid: tag.uuid,
    });
    this.typedContent.references = references;
  }
}
