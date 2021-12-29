import { PrefKey, PrefValue } from '../../../models/app/userPrefs';
import { ItemManager } from './item_manager';
import { PureService } from './pure_service';
import { SNSingletonManager } from './singleton_manager';
import { SNSyncService } from './sync/sync_service';
import { ApplicationStage } from '../../../stages';
declare const preferencesChangedEvent = "preferencesChanged";
declare type PreferencesChangedEvent = typeof preferencesChangedEvent;
export declare class SNPreferencesService extends PureService<PreferencesChangedEvent> {
    private singletonManager;
    private itemManager;
    private syncService;
    private shouldReload;
    private reloading;
    private preferences?;
    private removeItemObserver?;
    private removeSyncObserver?;
    constructor(singletonManager: SNSingletonManager, itemManager: ItemManager, syncService: SNSyncService);
    deinit(): void;
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    getValue<K extends PrefKey>(key: K, defaultValue: PrefValue[K] | undefined): PrefValue[K] | undefined;
    getValue<K extends PrefKey>(key: K, defaultValue: PrefValue[K]): PrefValue[K];
    setValue<K extends PrefKey>(key: K, value: PrefValue[K]): Promise<void>;
    private reload;
}
export {};
