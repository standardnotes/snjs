import omit from 'lodash/omit';
import { SNItem, ItemContent } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { Action } from './action';

/**
 * Related to the SNActionsService and the local Action model.
 */
export class SNActionsExtension extends SNItem {

  public actions: Action[] = []
  public description!: string
  public name!: string
  public url!: string
  public package_info!: Record<string, any>
  public supported_types!: string[]

  actionsWithContextForItem(item: SNItem) {
    return this.actions.filter((action) => {
      return (
        action.context === item.content_type ||
        action.context === 'Item'
      )
    });
  }

  mapContentToLocalProperties(content: ItemContent) {
    super.mapContentToLocalProperties(content);
    this.description = content.description;
    this.url = content.url;
    this.name = content.name;
    this.package_info = content.package_info;
    this.supported_types = content.supported_types;
    if (content.actions) {
      this.actions = content.actions.map((action: any) => {
        return new Action(action);
      });
    }
  }

  getDefaultContentType() {
    return ContentTypes.ActionsExtension;
  }

  structureParams() {
    const params = {
      name: this.name,
      url: this.url,
      package_info: this.package_info,
      description: this.description,
      actions: this.actions.map((a) => {
        return omit(a, ['subrows', 'subactions']);
      }),
      supported_types: this.supported_types
    };

    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }
}
