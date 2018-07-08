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
    var params = {
      title: this.title,
      text: this.text
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  addItemAsRelationship(item) {
    /*
    Legacy.
    Previously, note/tag relationships were bidirectional, however in some cases there
    may be broken links such that a note has references to a tag and not vice versa.
    Now, only tags contain references to notes. For old notes that may have references to tags,
    we want to transfer them over to the tag.
     */
    if(item.content_type == "Tag") {
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
    this.clearSavedTagsString();
  }

  isBeingRemovedLocally() {
    this.tags.forEach(function(tag){
      _.remove(tag.notes, {uuid: this.uuid});
    }.bind(this))
    super.isBeingRemovedLocally();
  }

  static filterDummyNotes(notes) {
    var filtered = notes.filter(function(note){return note.dummy == false || note.dummy == null});
    return filtered;
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    super.informReferencesOfUUIDChange();
    for(var tag of this.tags) {
      _.remove(tag.notes, {uuid: oldUUID});
      tag.notes.push(this);
    }
  }

  tagDidFinishSyncing(tag) {
    this.clearSavedTagsString();
  }

  safeText() {
    return this.text || "";
  }

  safeTitle() {
    return this.title || "";
  }

  toJSON() {
    return {uuid: this.uuid}
  }

  get content_type() {
    return "Note";
  }

  get displayName() {
    return "Note";
  }

  clearSavedTagsString() {
    this.savedTagsString = null;
  }

  tagsString() {
    this.savedTagsString = SNTag.arrayToDisplayString(this.tags);
    return this.savedTagsString;
  }
}
