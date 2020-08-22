import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNItem, ItemMutator } from '@Models/core/item';
import { Action } from './action';

/**
 * Related to the SNActionsService and the local Action model.
 */
export class SNActionsExtension extends SNItem {

  public readonly actions: Action[] = []
  public readonly description!: string
  public readonly name!: string
  public readonly url!: string
  public readonly package_info!: Record<string, any>
  public readonly supported_types!: string[]
  public readonly hidden: boolean
  public readonly loading: boolean

  constructor(payload: PurePayload) {
    super(payload);
    this.description = payload.safeContent.description;
    this.url = payload.safeContent.url;
    this.name = payload.safeContent.name;
    this.package_info = payload.safeContent.package_info;
    this.supported_types = payload.safeContent.supported_types;
    this.hidden = payload.safeContent.hidden || false;
    this.loading = payload.safeContent.loading || false;
    if (payload.safeContent.actions) {
      this.actions = payload.safeContent.actions.map((action: any) => {
        return new Action(action);
      });
    }
  }

  actionsWithContextForItem(item: SNItem) {
    return this.actions.filter((action) => {
      return (
        action.context === item.content_type ||
        action.context === 'Item'
      )
    });
  }
}

export class ActionsExtensionMutator extends ItemMutator {

  set description(description: string) {
    this.content!.description = description;
  }

  set supported_types(supported_types: string[]) {
    this.content!.supported_types = supported_types;
  }

  set actions(actions: Action[]) {
    this.content!.actions = actions;
  }

  set hidden(hidden: boolean) {
    this.content!.hidden = hidden;
  }

  set loading(loading: boolean) {
    this.content!.loading = loading;
  }
}