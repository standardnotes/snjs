import { DecryptedItemMutator } from '../../Abstract/Item/Implementations/DecryptedItemMutator'
import { FeatureRepoContent } from './FeatureRepo'

export class FeatureRepoMutator extends DecryptedItemMutator<FeatureRepoContent> {
  set migratedToUserSetting(migratedToUserSetting: boolean) {
    this.content.migratedToUserSetting = migratedToUserSetting
  }

  set migratedToOfflineEntitlements(migratedToOfflineEntitlements: boolean) {
    this.content.migratedToOfflineEntitlements = migratedToOfflineEntitlements
  }

  set offlineFeaturesUrl(offlineFeaturesUrl: string) {
    this.content.offlineFeaturesUrl = offlineFeaturesUrl
  }

  set offlineKey(offlineKey: string) {
    this.content.offlineKey = offlineKey
  }
}
