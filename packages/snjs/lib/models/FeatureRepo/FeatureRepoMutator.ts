import { ItemMutator } from '@Lib/models/Item/ItemMutator'

export class FeatureRepoMutator extends ItemMutator {
  set migratedToUserSetting(migratedToUserSetting: boolean) {
    this.content!.migratedToUserSetting = migratedToUserSetting
  }

  set migratedToOfflineEntitlements(migratedToOfflineEntitlements: boolean) {
    this.content!.migratedToOfflineEntitlements = migratedToOfflineEntitlements
  }

  set offlineFeaturesUrl(offlineFeaturesUrl: string) {
    this.content!.offlineFeaturesUrl = offlineFeaturesUrl
  }

  set offlineKey(offlineKey: string) {
    this.content!.offlineKey = offlineKey
  }
}
