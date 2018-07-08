export class SNTag extends SFItem {

  constructor(json_obj) {
    super(json_obj);

    if(!this.content_type) {
      this.content_type = "Tag";
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
    if(item.content_type == "Note") {
      if(!_.find(this.notes, {uuid: item.uuid})) {
        this.notes.push(item);
        item.tags.push(this);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type == "Note") {
      _.remove(this.notes, {uuid: item.uuid});
      _.remove(item.tags, {uuid: this.uuid});
    }
    super.removeItemAsRelationship(item);
  }

  updateLocalRelationships() {
    var references = this.content.references;

    var uuids = references.map(function(ref){return ref.uuid});
    this.notes.slice().forEach(function(note){
      if(!uuids.includes(note.uuid)) {
        _.remove(note.tags, {uuid: this.uuid});
        _.remove(this.notes, {uuid: note.uuid});

        note.setIsNoLongerBeingReferencedBy(this);
      }
    }.bind(this))
  }

  isBeingRemovedLocally() {
    this.notes.forEach((note) => {
      _.remove(note.tags, {uuid: this.uuid});
      note.setIsNoLongerBeingReferencedBy(this);
    })

    this.notes.length = 0;

    super.isBeingRemovedLocally();
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    for(var note of this.notes) {
      _.remove(note.tags, {uuid: oldUUID});
      note.tags.push(this);
    }
  }

  didFinishSyncing() {
    for(var note of this.notes) {
      note.tagDidFinishSyncing(this);
    }
  }

  isSmartTag() {
    return this.content_type == "SN|SmartTag";
  }

  get displayName() {
    return "Tag";
  }

  static arrayToDisplayString(tags) {
    return tags.sort((a, b) => {return a.title > b.title}).map(function(tag, i){
      return "#" + tag.title;
    }).join(" ");
  }
}
