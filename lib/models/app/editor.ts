import { SNNote } from './note';
import { SNItem, ItemContent } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { existsInArray, removeFromArray } from '@Lib/utils';

/**
 * @deprecated
 * Editor objects are depracated in favor of SNComponent objects
 */
export class SNEditor extends SNItem {

  public notes: SNNote[] = []
  public data: Record<string, any> = {}
  public url!: string
  public name!: string
  public isDefault!: boolean
  public systemEditor!: boolean

  mapContentToLocalProperties(content: ItemContent) {
    super.mapContentToLocalProperties(content);
    this.url = content.url;
    this.name = content.name;
    this.data = content.data || {};
    this.isDefault = content.default;
    this.systemEditor = content.systemEditor;
  }

  structureParams() {
    const params = {
      url: this.url,
      name: this.name,
      data: this.data,
      default: this.isDefault,
      systemEditor: this.systemEditor
    };

    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  referenceParams() {
    return this.notes.map((note) => {
      return {uuid: note.uuid, content_type: note.content_type};
    });
  }

  addItemAsRelationship(item: SNItem) {
    if(item.content_type === ContentTypes.Note) {
      if (!existsInArray(this.notes, item)) {
        this.notes.push(item as SNNote);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item: SNItem) {
    if(item.content_type === ContentTypes.Note) {
      removeFromArray(this.notes, item);
    }
    super.removeItemAsRelationship(item);
  }

  getDefaultContentType()  {
    return ContentTypes.Editor;
  }

  setData(key: string, value: any) {
    const dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);
    if(dataHasChanged) {
      this.data[key] = value;
      return true;
    }
    return false;
  }

  dataForKey(key: string) {
    return this.data[key] || {};
  }
}
