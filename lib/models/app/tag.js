import remove from 'lodash/remove';
import { findInArray } from '@Lib/utils';
import { SFItem } from '@Models/core/item';
import {
  CONTENT_TYPE_NOTE,
  CONTENT_TYPE_TAG,
  CONTENT_TYPE_SMART_TAG
} from '@Models/content_types';

export class SNTag extends SFItem {

  constructor(payload) {
    super(payload);
    if(!this.content_type) {
      this.content_type = CONTENT_TYPE_TAG;
    }
    if(!this.notes) {
      this.notes = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
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

  addItemAsRelationship(item) {
    if(item.content_type === CONTENT_TYPE_NOTE) {
      if(!findInArray(this.notes, 'uuid', item.uuid)) {
        this.notes.push(item);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type === CONTENT_TYPE_NOTE) {
      remove(this.notes, {uuid: item.uuid});
    }
    super.removeItemAsRelationship(item);
  }

  updateLocalRelationships() {
    const references = this.content.references;
    const uuids = references.map((ref) => ref.uuid);
    this.notes.slice().forEach((note) => {
      if(!uuids.includes(note.uuid)) {
        remove(this.notes, {uuid: note.uuid});
        note.setIsNoLongerReferencedBy(this);
      }
    })
  }

  isBeingRemovedLocally() {
    this.notes.forEach((note) => {
      note.setIsNoLongerReferencedBy(this);
    })

    this.notes.length = 0;
    super.isBeingRemovedLocally();
  }

  didCompleteMapping(source) {
    for(const note of this.notes) {
      note.tagDidCompleteMapping(this);
    }
  }

  isSmartTag() {
    return this.content_type === CONTENT_TYPE_SMART_TAG;
  }

  static arrayToDisplayString(tags) {
    return tags.sort((a, b) => {
      return a.title > b.title
    }).map((tag, i) => {
      return '#' + tag.title;
    }).join(' ');
  }
}
