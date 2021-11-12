import { SNComponent } from '@Models/app/component';
import { ConflictStrategy } from './../../protocol/payloads/deltas/strategies';
import { HistoryEntry } from './../../services/history/entries/history_entry';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { ItemMutator, SNItem } from '@Models/core/item';
import { Action } from './action';

/**
 * Related to the SNActionsService and the local Action model.
 */
export class SNActionsExtension extends SNComponent {
  public readonly actions: Action[] = [];
  public readonly description!: string;
  public readonly url!: string;
  public readonly supported_types!: string[];
  public readonly deprecation?: string;

  constructor(payload: PurePayload) {
    super(payload);
    this.description = payload.safeContent.description;
    this.url = payload.safeContent.hosted_url || payload.safeContent.url;
    this.supported_types = payload.safeContent.supported_types;
    this.deprecation = payload.safeContent.deprecation;
    if (payload.safeContent.actions) {
      this.actions = payload.safeContent.actions.map((action: any) => {
        return new Action(action);
      });
    }
  }

  actionsWithContextForItem(item: SNItem) {
    return this.actions.filter((action) => {
      return action.context === item.content_type || action.context === 'Item';
    });
  }

  /** Do not duplicate. Always keep original */
  strategyWhenConflictingWithItem(
    item: SNItem,
    previousRevision?: HistoryEntry
  ): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision);
    }

    return ConflictStrategy.KeepLeft;
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

  set deprecation(deprecation: string) {
    this.content!.deprecation = deprecation;
  }
}
