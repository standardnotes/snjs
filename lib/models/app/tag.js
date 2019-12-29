import remove from 'lodash/remove';
import { findInArray } from '@Lib/utils';
import { SFItem } from '@Models/core/item';
import {
  NOTE_CONTENT_TYPE,
  TAG_CONTENT_TYPE,
  SMART_TAG_CONTENT_TYPE
} from '@Lib/constants';

export class SNTag extends SFItem {

  constructor(json_obj) {
    super(json_obj);

    if(!this.content_type) {
      this.content_type = TAG_CONTENT_TYPE;
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
    var params = {
      title: this.title
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  addItemAsRelationship(item) {
    if(item.content_type === NOTE_CONTENT_TYPE) {
      if(!findInArray(this.notes, 'uuid', item.uuid)) {
        this.notes.push(item);
        item.tags.push(this);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type === NOTE_CONTENT_TYPE) {
      remove(this.notes, {uuid: item.uuid});
      remove(item.tags, {uuid: this.uuid});
    }
    super.removeItemAsRelationship(item);
  }

  updateLocalRelationships() {
    var references = this.content.references;

    var uuids = references.map(function(ref){return ref.uuid});
    this.notes.slice().forEach(function(note){
      if(!uuids.includes(note.uuid)) {
        remove(note.tags, {uuid: this.uuid});
        remove(this.notes, {uuid: note.uuid});

        note.setIsNoLongerBeingReferencedBy(this);
      }
    }.bind(this))
  }

  isBeingRemovedLocally() {
    this.notes.forEach((note) => {
      remove(note.tags, {uuid: this.uuid});
      note.setIsNoLongerBeingReferencedBy(this);
    })

    this.notes.length = 0;

    super.isBeingRemovedLocally();
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    for(var note of this.notes) {
      remove(note.tags, {uuid: oldUUID});
      note.tags.push(this);
    }
  }

  didFinishSyncing() {
    for(let note of this.notes) {
      note.tagDidFinishSyncing(this);
    }
  }

  isSmartTag() {
    return this.content_type === SMART_TAG_CONTENT_TYPE;
  }

  get displayName() {
    return TAG_CONTENT_TYPE;
  }

  static arrayToDisplayString(tags) {
    return tags.sort((a, b) => {return a.title > b.title}).map(function(tag, i){
      return "#" + tag.title;
    }).join(" ");
  }
}
