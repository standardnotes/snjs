import { removeFromArray, findInArray } from '@Lib/utils';
import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { SNTag } from '@Models/app/tag';

export class SNNote extends SFItem {

  constructor(payload) {
    super(payload);
    if(!this.text) {
      /**
      * Some external editors can't handle a null value for text.
      * Notes created on mobile with no text have a null value for it,
      * so we'll just set a default here.
      */
      this.text = '';
    }
    if(!this.tags) {
      this.tags = [];
    }
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.Note;
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
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
    if(item.content_type === ContentTypes.Tag) {
      item.addItemAsRelationship(this);
    }
    super.addItemAsRelationship(item);
  }

  setIsBeingReferencedBy(item) {
    if(item.content_type === ContentTypes.Tag) {
      if(!findInArray(this.tags, 'uuid', item.uuid)) {
        this.tags.push(item);
      }
    }
    super.setIsBeingReferencedBy(item);
    this.clearSavedTagsString();
  }

  setIsNoLongerReferencedBy(item) {
    super.setIsNoLongerReferencedBy(item);
    if(item.content_type === ContentTypes.Tag) {
      removeFromArray(this.tags, item);
    }

    /**
     * @legacy Two-way note-tag relationships need to be handled explicitly.
     */
    if(item.content_type === ContentTypes.Tag && this.hasRelationshipWithItem(item)) {
      this.removeReferenceWithUuid(item.uuid);
      /** @todo Items shouldn't mark themselves dirty. */
      /** @legacy this.setDirty(true); */
    }

    this.clearSavedTagsString();
  }

  static filterDummyNotes(notes) {
    return notes.filter((note) => {
      return note.dummy === false || note.dummy === null;
    });
  }

  tagDidCompleteMapping(tag) {
    this.clearSavedTagsString();
  }

  safeText() {
    return this.text || '';
  }

  safeTitle() {
    return this.title || '';
  }

  clearSavedTagsString() {
    this.savedTagsString = null;
  }

  tagsString() {
    this.savedTagsString = SNTag.arrayToDisplayString(this.tags);
    return this.savedTagsString;
  }
}
