import { ContentType, SNPredicate, SNUserPrefs } from '@Lib/models';
import {
  PrefKey,
  PrefValue,
  UserPrefsMutator,
} from '@Lib/models/app/userPrefs';
import { FillItemContent } from '@Lib/models/functions';
import { ItemManager } from './item_manager';
import { PureService } from './pure_service';
import { SNSingletonManager } from './singleton_manager';
import { SNSyncService } from './sync/sync_service';
import { SyncEvent } from './sync/events';

export class SNPreferencesService extends PureService<'preferencesChanged'> {
  private shouldReload = true;
  private reloading = false;
  private preferences?: SNUserPrefs;
  private removeItemObserver?: () => void;
  private removeSyncObserver?: () => void;

  constructor(
    private singletonManager: SNSingletonManager,
    private itemManager: ItemManager,
    syncService: SNSyncService
  ) {
    super();

    this.removeItemObserver = itemManager.addObserver(
      ContentType.UserPrefs,
      () => {
        this.shouldReload = true;
      }
    );

    this.removeSyncObserver = syncService.addEventObserver(async (event) => {
      if (event === SyncEvent.FullSyncCompleted) {
        this.reload();
      }
    });
  }

  deinit(): void {
    this.removeItemObserver?.();
    this.removeSyncObserver?.();
    (this.singletonManager as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
  }

  getValue<K extends PrefKey>(
    key: K,
    defaultValue: PrefValue[K] | undefined
  ): PrefValue[K] | undefined;
  getValue<K extends PrefKey>(key: K, defaultValue: PrefValue[K]): PrefValue[K];
  getValue<K extends PrefKey>(
    key: K,
    defaultValue?: PrefValue[K]
  ): PrefValue[K] | undefined {
    return this.preferences?.getPref(key) ?? defaultValue;
  }

  async setValue<K extends PrefKey>(
    key: K,
    value: PrefValue[K]
  ): Promise<void> {
    if (!this.preferences) return;
    this.preferences = (await this.itemManager.changeItem<UserPrefsMutator>(
      this.preferences.uuid,
      (m) => {
        m.setPref(key, value);
      }
    )) as SNUserPrefs;
    this.notifyEvent('preferencesChanged');
  }

  private async reload() {
    if (!this.shouldReload || this.reloading) {
      return;
    }
    this.reloading = true;
    try {
      const contentType = ContentType.UserPrefs;
      const predicate = new SNPredicate('content_type', '=', contentType);
      const previousRef = this.preferences;
      this.preferences = await this.singletonManager.findOrCreateSingleton<SNUserPrefs>(
        predicate,
        contentType,
        FillItemContent({})
      );
      if (
        previousRef?.uuid !== this.preferences.uuid ||
        this.preferences.userModifiedDate > previousRef.userModifiedDate
      ) {
        this.notifyEvent('preferencesChanged');
      }
      this.shouldReload = false;
    } finally {
      this.reloading = false;
    }
  }
}
