import { SNItem } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { findInArray, removeFromArray, filterFromArray } from '@Lib/utils';
import { ContentType } from '@Models/content_types';

/**
 * Allows organization of notes into groups. A tag can have many notes, and a note
 * can have many tags.
 */
export class SNTag extends SNItem {

  public title!: string
  public notes: SNItem[] = []

  getDefaultContentType() {
    return ContentType.Tag;
  }

  protected mapContentToLocalProperties(content: PayloadContent) {
    super.mapContentToLocalProperties(content);
    this.title = content.title;
  }

  structureParams() {
    const params = {
      title: this.title
    };

    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  /** @todo this function seems like it shouldn't be neccessary, but currently causes failing tests if removed */
  public updateLocalRelationships() {
    const references = this.content.references;
    const uuids = references.map((ref) => ref.uuid);
    this.notes.slice().forEach((note) => {
      if (!uuids.includes(note.uuid)) {
        filterFromArray(this.notes, { uuid: note.uuid });
        note.setIsNoLongerReferencedBy(this);
      }
    });
  }

  public addItemAsRelationship(item: SNItem) {
    if (item.content_type === ContentType.Note) {
      if (!findInArray(this.notes, 'uuid', item.uuid as any)) {
        this.notes.push(item);
      }
    }
    super.addItemAsRelationship(item);
  }

  public removeItemAsRelationship(item: SNItem) {
    if (item.content_type === ContentType.Note) {
      filterFromArray(this.notes, { uuid: item.uuid });
    }
    super.removeItemAsRelationship(item);
  }

  public isBeingRemovedLocally() {
    this.notes.forEach((note) => {
      note.setIsNoLongerReferencedBy(this);
    });

    this.notes.length = 0;
    super.isBeingRemovedLocally();
  }

  public isSmartTag() {
    return this.content_type === ContentType.SmartTag;
  }

  public static arrayToDisplayString(tags: SNTag[]) {
    return tags.sort((a, b) => {
      return a.title > b.title ? 1 : -1;
    }).map((tag) => {
      return '#' + tag.title;
    }).join(' ');
  }
}
