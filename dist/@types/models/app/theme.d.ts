import { SNItem, ItemMutator } from '../core/item';
import { ConflictStrategies } from '../../protocol/payloads/deltas';
import { SNComponent, ComponentAreas } from './component';
export declare class SNTheme extends SNComponent {
    area: ComponentAreas;
    isLayerable(): any;
    /** Do not duplicate under most circumstances. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem): ConflictStrategies.KeepLeft | ConflictStrategies.KeepRight | ConflictStrategies.KeepLeftDuplicateRight | ConflictStrategies.KeepLeftMergeRefs;
    getMobileRules(): any;
    /** Same as getMobileRules but without default value. */
    hasMobileRules(): any;
    getNotAvailOnMobile(): any;
    isMobileActive(): any;
}
export declare class ThemeMutator extends ItemMutator {
    setMobileRules(rules: any): void;
    setNotAvailOnMobile(notAvailable: boolean): void;
    /**
     * We must not use .active because if you set that to true, it will also
     * activate that theme on desktop/web
     */
    setMobileActive(active: boolean): void;
}
