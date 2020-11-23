import { ItemMutator, SNItem } from '@Models/core/item';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { ContentType } from '@Models/content_types';

/**
 * Allows organization of notes into groups. A tag can have many notes, and a note
 * can have many tags.
 */
export class SNTag extends SNItem {

  public readonly title!: string
  
  constructor(payload: PurePayload) {
    super(payload);
    this.title = this.payload.safeContent.title;
  }

  get noteCount() {
    return this.payload.safeReferences.length;
  }

  public isSmartTag() {
    return this.content_type === ContentType.SmartTag;
  }

  public get isAllTag() {
    return this.payload.safeContent.isAllTag;
  }

  public get isTrashTag() {
    return this.payload.safeContent.isTrashTag;
  }

  public get isArchiveTag() {
    return this.payload.safeContent.isArchiveTag;
  }

  public static arrayToDisplayString(tags: SNTag[]) {
    return tags.sort((a, b) => {
      return a.title > b.title ? 1 : -1;
    }).map((tag) => {
      return '#' + tag.title;
    }).join(' ');
  }
}

export class TagMutator extends ItemMutator {
  set title(title: string) {
    this.content!.title = title;
  }
}