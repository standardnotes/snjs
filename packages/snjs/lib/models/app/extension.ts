import {
  FeatureDescription,
  ThirdPartyFeatureDescription,
} from '@standardnotes/features';
import { ConflictStrategy } from './../../protocol/payloads/deltas/strategies';
import { HistoryEntry } from './../../services/history/entries/history_entry';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { ItemMutator, SNItem } from '@Models/core/item';
import { Action } from './action';

/**
 * Related to the SNActionsService and the local Action model.
 */
export class SNActionsExtension extends SNItem {
  public readonly actions: Action[] = [];
  public readonly description: string;
  public readonly url: string;
  public readonly supported_types: string[];
  public readonly deprecation?: string;
  public readonly name: string;
  public readonly package_info: FeatureDescription;

  constructor(payload: PurePayload) {
    super(payload);
    this.name = payload.safeContent.name || '';
    this.description = payload.safeContent.description || '';
    this.url = payload.safeContent.hosted_url || payload.safeContent.url;
    this.supported_types = payload.safeContent.supported_types;
    this.package_info = this.payload.safeContent.package_info || {};
    this.deprecation = payload.safeContent.deprecation;
    if (payload.safeContent.actions) {
      this.actions = payload.safeContent.actions.map((action: any) => {
        return new Action(action);
      });
    }
  }

  public get thirdPartyPackageInfo(): ThirdPartyFeatureDescription {
    return this.package_info as ThirdPartyFeatureDescription;
  }

  public get isListedExtension(): boolean {
    return (
      (this.package_info.identifier as string) === 'org.standardnotes.listed'
    );
  }

  actionsWithContextForItem(item: SNItem): Action[] {
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
