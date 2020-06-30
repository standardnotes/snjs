import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNItem, ItemMutator } from '../core/item';
import { Action } from './action';
/**
 * Related to the SNActionsService and the local Action model.
 */
export declare class SNActionsExtension extends SNItem {
    readonly actions: Action[];
    readonly description: string;
    readonly name: string;
    readonly url: string;
    readonly package_info: Record<string, any>;
    readonly supported_types: string[];
    readonly hidden: boolean;
    constructor(payload: PurePayload);
    actionsWithContextForItem(item: SNItem): Action[];
}
export declare class ActionsExtensionMutator extends ItemMutator {
    set description(description: string);
    set supported_types(supported_types: string[]);
    set actions(actions: Action[]);
    set hidden(hidden: boolean);
}
