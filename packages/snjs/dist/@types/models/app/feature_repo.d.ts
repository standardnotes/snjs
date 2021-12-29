import { ItemMutator, SNItem } from '../core/item';
export interface FeatureRepoContent {
    migratedToUserSetting?: boolean;
    migratedToOfflineEntitlements?: boolean;
    offlineFeaturesUrl?: string;
    offlineKey?: string;
}
export declare class SNFeatureRepo extends SNItem {
    get migratedToUserSetting(): boolean;
    get migratedToOfflineEntitlements(): boolean;
    get onlineUrl(): string;
    get offlineFeaturesUrl(): string;
    get offlineKey(): string;
}
export declare class FeatureRepoMutator extends ItemMutator {
    set migratedToUserSetting(migratedToUserSetting: boolean);
    set migratedToOfflineEntitlements(migratedToOfflineEntitlements: boolean);
    set offlineFeaturesUrl(offlineFeaturesUrl: string);
    set offlineKey(offlineKey: string);
}
