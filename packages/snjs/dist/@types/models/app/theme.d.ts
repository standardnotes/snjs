import { ItemMutator, SNItem } from '../core/item';
import { ConflictStrategy } from '../../protocol/payloads/deltas/strategies';
import { ComponentArea, SNComponent } from './component';
import { HistoryEntry } from '../../services/history/entries/history_entry';
export declare class SNTheme extends SNComponent {
    area: ComponentArea;
    isLayerable(): boolean;
    /** Do not duplicate under most circumstances. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy;
    getMobileRules(): any;
    /** Same as getMobileRules but without default value. */
    hasMobileRules(): any;
    getNotAvailOnMobile(): any;
    isMobileActive(): any;
}
export declare class ThemeMutator extends ItemMutator {
    setMobileRules(rules: any): void;
    setNotAvailOnMobile(notAvailable: boolean): void;
    set local_url(local_url: string);
    /**
     * We must not use .active because if you set that to true, it will also
     * activate that theme on desktop/web
     */
    setMobileActive(active: boolean): void;
}
