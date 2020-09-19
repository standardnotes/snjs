import { ConflictStrategy } from '../../protocol/payloads/deltas/strategies';
import { SNItem, ItemMutator } from '../core/item';
/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export declare class SNItemsKey extends SNItem {
    /** Do not duplicate items keys. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem): ConflictStrategy;
    get keyVersion(): any;
    get isItemsKey(): boolean;
    get isDefault(): any;
    get itemsKey(): any;
    get dataAuthenticationKey(): any;
}
export declare class ItemsKeyMutator extends ItemMutator {
    set isDefault(isDefault: boolean);
}
