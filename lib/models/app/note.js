import remove from 'lodash/remove';
import { SFItem } from '@Models/core/item'
import { SNTag } from '@Models/app/tag'
import { NOTE_CONTENT_TYPE, TAG_CONTENT_TYPE } from '@Lib/constants';

export class SNNote extends SFItem {

  constructor(json_obj) {
    super(json_obj);

    if(!this.text) {
      // Some external editors can't handle a null value for text.
      // Notes created on mobile with no text have a null value for it,
      // so we'll just set a default here.
      this.text = "";
    }

    if(!this.tags) {
      this.tags = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.title = content.title;
    this.text = content.text;
  }

  structureParams() {
    const params = {
      title: this.title,
      text: this.text
    };

    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  addItemAsRelationship(item) {
    /**
     * @legacy
     * In v2, note/tag relationships were bidirectional, however in some cases there
     * may be broken links such that a note has references to a tag and not vice versa.
     * Now, only tags contain references to notes. For old notes that may have references to tags,
     * we want to transfer them over to the tag.
     */
    if(item.content_type === TAG_CONTENT_TYPE) {
      item.addItemAsRelationship(this);
    }
    super.addItemAsRelationship(item);
  }

  setIsBeingReferencedBy(item) {
    super.setIsBeingReferencedBy(item);
    this.clearSavedTagsString();
  }

  setIsNoLongerBeingReferencedBy(item) {
    super.setIsNoLongerBeingReferencedBy(item);

    // Legacy two-way note-tag relationships need to be handled explicitly.
    if(item.content_type === TAG_CONTENT_TYPE && this.hasRelationshipWithItem(item)) {
      this.removeReferenceWithUuid(item.uuid);
      this.setDirty(true);
    }

    this.clearSavedTagsString();
  }

  isBeingRemovedLocally() {
    this.tags.forEach(function(tag){
      remove(tag.notes, {uuid: this.uuid});
    }.bind(this))
    super.isBeingRemovedLocally();
  }

  static filterDummyNotes(notes) {
    const filtered = notes.filter(function(note){return note.dummy == false || note.dummy == null});
    return filtered;
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    super.informReferencesOfUUIDChange();
    for(const tag of this.tags) {
      remove(tag.notes, {uuid: oldUUID});
      tag.notes.push(this);
    }
  }

  tagDidFinishSyncing(tag) {
    this.clearSavedTagsString();
  }

  safeText() {
    return this.text || '';
  }

  safeTitle() {
    return this.title || '';
  }

  get content_type() {
    return NOTE_CONTENT_TYPE;
  }

  get displayName() {
    return NOTE_CONTENT_TYPE;
  }

  clearSavedTagsString() {
    this.savedTagsString = null;
  }

  tagsString() {
    this.savedTagsString = SNTag.arrayToDisplayString(this.tags);
    return this.savedTagsString;
  }
}
