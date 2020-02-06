import omit from 'lodash/omit';
import { ContentTypes, SFItem } from '@Models';
import { Action } from './action';

export class SNActionsExtension extends SFItem {
  constructor(json) {
    super(json);
    if (json.actions) {
      this.actions = json.actions.map((action) => {
        return new Action(action);
      });
    }
    if (!this.actions) {
      this.actions = [];
    }
  }

  actionsWithContextForItem(item) {
    return this.actions.filter((action) => {
      return action.context === item.content_type || action.context === 'Item';
    });
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    this.description = content.description;
    this.url = content.url;
    this.name = content.name;
    this.package_info = content.package_info;
    this.supported_types = content.supported_types;
    if (content.actions) {
      this.actions = content.actions.map((action) => {
        return new Action(action);
      });
    }
  }

  // eslint-disable-next-line camelcase
  get content_type() {
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
