import { HistoryEntry } from '../../services/history/entries/history_entry';
import { ItemMutator, SNItem } from '../core/item';
import { ConflictStrategy } from '../../protocol/payloads/deltas/strategies';
/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */
export declare class SNItemsKey extends SNItem {
    /** Do not duplicate items keys. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy;
    get keyVersion(): string | undefined;
    get isItemsKey(): boolean;
    get isDefault(): boolean | undefined;
    get itemsKey(): string | undefined;
    get dataAuthenticationKey(): string | undefined;
}
export declare class ItemsKeyMutator extends ItemMutator {
    set isDefault(isDefault: boolean);
}
