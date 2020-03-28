import remove from 'lodash/remove';
import { findInArray } from '@Lib/utils';
import { SNItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';

/**
 * Allows organization of notes into groups. A tag can have many notes, and a note
 * can have many tags.
 */
export class SNTag extends SNItem {
  constructor(payload) {
    super(payload);
    if (!this.notes) {
      this.notes = [];
    }
  }
  
  getDefaultContentType() {
    return ContentTypes.Tag;
  }

  mapContentToLocalProperties(content) {
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
  updateLocalRelationships() {
    const references = this.content.references;
    const uuids = references.map((ref) => ref.uuid);
    this.notes.slice().forEach((note) => {
      if (!uuids.includes(note.uuid)) {
        remove(this.notes, { uuid: note.uuid });
        note.setIsNoLongerReferencedBy(this);
      }
    });
  }

  addItemAsRelationship(item) {
    if (item.content_type === ContentTypes.Note) {
      if (!findInArray(this.notes, 'uuid', item.uuid)) {
        this.notes.push(item);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if (item.content_type === ContentTypes.Note) {
      remove(this.notes, { uuid: item.uuid });
    }
    super.removeItemAsRelationship(item);
  }

  isBeingRemovedLocally() {
    this.notes.forEach((note) => {
      note.setIsNoLongerReferencedBy(this);
    });

    this.notes.length = 0;
    super.isBeingRemovedLocally();
  }

  didCompleteMapping(_) {
    for (const note of this.notes) {
      note.tagDidCompleteMapping(this);
    }
  }

  isSmartTag() {
    return this.content_type === ContentTypes.SmartTag;
  }

  static arrayToDisplayString(tags) {
    return tags.sort((a, b) => {
      return a.title > b.title;
    }).map((tag, i) => {
      return '#' + tag.title;
    }).join(' ');
  }
}
