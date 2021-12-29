import { SNComponent } from '../../../../models/app/component';
import { ConflictStrategy } from './../../protocol/payloads/deltas/strategies';
import { HistoryEntry } from './../../services/history/entries/history_entry';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { ItemMutator, SNItem } from '../../../../models/core/item';
import { Action } from './action';
/**
 * Related to the SNActionsService and the local Action model.
 */
export declare class SNActionsExtension extends SNComponent {
    readonly actions: Action[];
    readonly description: string;
    readonly url: string;
    readonly supported_types: string[];
    readonly deprecation?: string;
    constructor(payload: PurePayload);
    actionsWithContextForItem(item: SNItem): Action[];
    /** Do not duplicate. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy;
}
export declare class ActionsExtensionMutator extends ItemMutator {
    set description(description: string);
    set supported_types(supported_types: string[]);
    set actions(actions: Action[]);
    set deprecation(deprecation: string);
}
