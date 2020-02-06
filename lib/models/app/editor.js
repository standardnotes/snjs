import map from 'lodash/map';
import find from 'lodash/find';
import pull from 'lodash/pull';
import remove from 'lodash/remove';
import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';

/**
 * @legacy
 * Editor objects are depracated in favor of SNComponent objects
 */
export class SNEditor extends SFItem {

  constructor(payload) {
    super(payload);
    if(!this.notes) {
      this.notes = [];
    }
    if(!this.data) {
      this.data = {};
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.url = content.url;
    this.name = content.name;
    this.data = content.data || {};
    this.default = content.default;
    this.systemEditor = content.systemEditor;
  }

  structureParams() {
    const params = {
      url: this.url,
      name: this.name,
      data: this.data,
      default: this.default,
      systemEditor: this.systemEditor
    };

    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  referenceParams() {
    const references = map(this.notes, function(note){
      return {uuid: note.uuid, content_type: note.content_type};
    });
    return references;
  }

  addItemAsRelationship(item) {
    if(item.content_type === ContentTypes.Note) {
      if(!find(this.notes, item)) {
        this.notes.push(item);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type === ContentTypes.Note) {
      pull(this.notes, item);
    }
    super.removeItemAsRelationship(item);
  }

  removeAndDirtyAllRelationships() {
    super.removeAndDirtyAllRelationships();
    this.notes = [];
  }

  removeReferencesNotPresentIn(references) {
    super.removeReferencesNotPresentIn(references);

    const uuids = references.map((ref) => {
      return ref.uuid;
    });
    this.notes.forEach((note) => {
      if(!uuids.includes(note.uuid)) {
        remove(this.notes, {uuid: note.uuid});
      }
    });
  }

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.Editor;
  }

  setData(key, value) {
    const dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);
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
