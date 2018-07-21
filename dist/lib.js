export class SNComponent extends SFItem {

  constructor(json_obj) {
    // If making a copy of an existing component (usually during sign in if you have a component active in the session),
    // which may have window set, you may get a cross-origin exception since you'll be trying to copy the window. So we clear it here.
    json_obj.window = null;

    super(json_obj);

    if(!this.componentData) {
      this.componentData = {};
    }

    if(!this.disassociatedItemIds) {
      this.disassociatedItemIds = [];
    }

    if(!this.associatedItemIds) {
      this.associatedItemIds = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    /* Legacy */
    // We don't want to set the url directly, as we'd like to phase it out.
    // If the content.url exists, we'll transfer it to legacy_url
    // We'll only need to set this if content.hosted_url is blank, otherwise, hosted_url is the url replacement.
    if(!content.hosted_url) {
      this.legacy_url = content.url;
    }

    /* New */
    this.local_url = content.local_url;
    this.hosted_url = content.hosted_url || content.url;
    this.offlineOnly = content.offlineOnly;

    if(content.valid_until) {
      this.valid_until = new Date(content.valid_until);
    }

    this.name = content.name;
    this.autoupdateDisabled = content.autoupdateDisabled;

    this.package_info = content.package_info;

    // the location in the view this component is located in. Valid values are currently tags-list, note-tags, and editor-stack`
    this.area = content.area;

    this.permissions = content.permissions;
    if(!this.permissions) {
      this.permissions = [];
    }

    this.active = content.active;

    // custom data that a component can store in itself
    this.componentData = content.componentData || {};

    // items that have requested a component to be disabled in its context
    this.disassociatedItemIds = content.disassociatedItemIds || [];

    // items that have requested a component to be enabled in its context
    this.associatedItemIds = content.associatedItemIds || [];
  }

  handleDeletedContent() {
    super.handleDeletedContent();

    this.active = false;
  }

  structureParams() {
    var params = {
      legacy_url: this.legacy_url,
      hosted_url: this.hosted_url,
      local_url: this.local_url,
      valid_until: this.valid_until,
      offlineOnly: this.offlineOnly,
      name: this.name,
      area: this.area,
      package_info: this.package_info,
      permissions: this.permissions,
      active: this.active,
      autoupdateDisabled: this.autoupdateDisabled,
      componentData: this.componentData,
      disassociatedItemIds: this.disassociatedItemIds,
      associatedItemIds: this.associatedItemIds,
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  get content_type() {
    return "SN|Component";
  }

  isEditor() {
    return this.area == "editor-editor";
  }

  isTheme() {
    return this.content_type == "SN|Theme" || this.area == "themes";
  }

  isDefaultEditor() {
    return this.getAppDataItem("defaultEditor") == true;
  }

  setLastSize(size) {
    this.setAppDataItem("lastSize", size);
  }

  getLastSize() {
    return this.getAppDataItem("lastSize");
  }

  /*
    The key used to look up data that this component may have saved to an item.
    This key will be look up on the item, and not on itself.
   */
  getClientDataKey() {
    if(this.legacy_url) {
      return this.legacy_url;
    } else {
      return this.uuid;
    }
  }

  hasValidHostedUrl() {
    return this.hosted_url || this.legacy_url;
  }

  keysToIgnoreWhenCheckingContentEquality() {
    return ["active"].concat(super.keysToIgnoreWhenCheckingContentEquality());
  }


  /*
    An associative component depends on being explicitly activated for a given item, compared to a dissaciative component,
    which is enabled by default in areas unrelated to a certain item.
   */
   static associativeAreas() {
     return ["editor-editor"];
   }

  isAssociative() {
    return Component.associativeAreas().includes(this.area);
  }

  associateWithItem(item) {
    this.associatedItemIds.push(item.uuid);
  }

  isExplicitlyEnabledForItem(item) {
    return this.associatedItemIds.indexOf(item.uuid) !== -1;
  }

  isExplicitlyDisabledForItem(item) {
    return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
  }
}
;export class SNEditor extends SFItem {

  constructor(json_obj) {
    super(json_obj);
    if(!this.notes) {
      this.notes = [];
    }
    if(!this.data) {
      this.data = {};
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.url = content.url;
    this.name = content.name;
    this.data = content.data || {};
    this.default = content.default;
    this.systemEditor = content.systemEditor;
  }

  structureParams() {
    var params = {
      url: this.url,
      name: this.name,
      data: this.data,
      default: this.default,
      systemEditor: this.systemEditor
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  referenceParams() {
    var references = _.map(this.notes, function(note){
      return {uuid: note.uuid, content_type: note.content_type};
    })

    return references;
  }

  addItemAsRelationship(item) {
    if(item.content_type == "Note") {
      if(!_.find(this.notes, item)) {
        this.notes.push(item);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type == "Note") {
      _.pull(this.notes, item);
    }
    super.removeItemAsRelationship(item);
  }

  removeAndDirtyAllRelationships() {
    super.removeAndDirtyAllRelationships();
    this.notes = [];
  }

  removeReferencesNotPresentIn(references) {
    super.removeReferencesNotPresentIn(references);

    var uuids = references.map(function(ref){return ref.uuid});
    this.notes.forEach(function(note){
      if(!uuids.includes(note.uuid)) {
        _.remove(this.notes, {uuid: note.uuid});
      }
    }.bind(this))
  }

  potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
    if(newItem.content_type === "Note" && _.find(this.notes, {uuid: oldUUID})) {
      _.remove(this.notes, {uuid: oldUUID});
      this.notes.push(newItem);
    }
  }

  get content_type() {
    return "SN|Editor";
  }

  setData(key, value) {
    var dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);
    if(dataHasChanged) {
      this.data[key] = value;
      return true;
    }
    return false;
  }

  dataForKey(key) {
    return this.data[key] || {};
  }
}
;export class Action {
  constructor(json) {
    _.merge(this, json);
    this.running = false; // in case running=true was synced with server since model is uploaded nondiscriminatory
    this.error = false;
    if(this.lastExecuted) {
      // is string
      this.lastExecuted = new Date(this.lastExecuted);
    }
  }
}

export class SNExtension extends SFItem {
  constructor(json) {
      super(json);

      if(json.actions) {
        this.actions = json.actions.map(function(action){
          return new Action(action);
        })
      }

      if(!this.actions) {
        this.actions = [];
      }
  }

  actionsWithContextForItem(item) {
    return this.actions.filter(function(action){
      return action.context == item.content_type || action.context == "Item";
    })
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.description = content.description;
    this.url = content.url;
    this.name = content.name;
    this.package_info = content.package_info;
    this.supported_types = content.supported_types;
    if(content.actions) {
      this.actions = content.actions.map(function(action){
        return new Action(action);
      })
    }
  }

  get content_type() {
    return "Extension";
  }

  structureParams() {
    var params = {
      name: this.name,
      url: this.url,
      package_info: this.package_info,
      description: this.description,
      actions: this.actions.map((a) => {return _.omit(a, ["subrows", "subactions"])}),
      supported_types: this.supported_types
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

}
;export class SNNote extends SFItem {

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
;export class SNTag extends SFItem {

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
;export class SNEncryptedStorage extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.storage = content.storage;
  }

  get content_type() {
    return "SN|EncryptedStorage";
  }

}
;export class SNMfa extends SFItem {

  constructor(json_obj) {
    super(json_obj);
  }

  // mapContentToLocalProperties(content) {
  //   super.mapContentToLocalProperties(content)
  //   this.serverContent = content;
  // }
  //
  // structureParams() {
  //   return _.merge(this.serverContent, super.structureParams());
  // }

  get content_type() {
    return "SF|MFA";
  }

  doNotEncrypt() {
    return true;
  }

}
;export class SNServerExtension extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.url = content.url;
  }

  get content_type() {
    return "SF|Extension";
  }

  doNotEncrypt() {
    return true;
  }
}
;export class SNSmartTag extends SNTag {

  isReferencingArchivedNotes() {
    var predicate = this.content.predicate;
    if(Array.isArray(predicate))  {
      predicate = SFPredicate.fromArray(predicate);
    }
    return predicate.keypath.includes("archived");
  }

  get content_type() {
    return "SN|SmartTag";
  }

}
;export class SNTheme extends SNComponent {

  constructor(json_obj) {
    super(json_obj);
    this.area = "themes";
  }

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }

  get content_type() {
    return "SN|Theme";
  }

  get displayName() {
    return "Theme";
  }

  setMobileRules(rules) {
    this.setAppDataItem("mobileRules", rules);
  }

  getMobileRules() {
    return this.getAppDataItem("mobileRules") || {constants: {}, rules: {}};
  }

  // Same as getMobileRules but without default value
  hasMobileRules() {
    return this.getAppDataItem("mobileRules");
  }

  setNotAvailOnMobile(na) {
    this.setAppDataItem("notAvailableOnMobile", na);
  }

  getNotAvailOnMobile() {
    return this.getAppDataItem("notAvailableOnMobile");
  }

  /* We must not use .active because if you set that to true, it will also activate that theme on desktop/web */
  setMobileActive(active) {
    this.setAppDataItem("mobileActive", active);
  }

  isMobileActive() {
    return this.getAppDataItem("mobileActive");
  }
}
;import {SFItem} from 'standard-file-js';

if(typeof window !== 'undefined' && window !== null) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    window.SNNote = SNNote;
    window.SNTag = SNTag;
    window.SNSmartTag = SNSmartTag;
    window.SNMfa = SNMfa;
    window.SNServerExtension = SNServerExtension;
    window.SNComponent = SNComponent;
    window.SNEditor = SNEditor;
    window.SNExtension = SNExtension;
    window.SNTheme = SNTheme;
    window.SNEncryptedStorage = SNEncryptedStorage;
  } catch (e) {
    console.log("Exception while exporting sn-models window variables", e);
  }
}
