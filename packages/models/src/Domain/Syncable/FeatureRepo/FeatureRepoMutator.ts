import { ItemMutator } from '../../Abstract/Item/Implementations/ItemMutator'
import { FeatureRepoContent } from './FeatureRepo'

export class FeatureRepoMutator extends ItemMutator<FeatureRepoContent> {
  set migratedToUserSetting(migratedToUserSetting: boolean) {
    this.sureContent.migratedToUserSetting = migratedToUserSetting
  }

  set migratedToOfflineEntitlements(migratedToOfflineEntitlements: boolean) {
    this.sureContent.migratedToOfflineEntitlements = migratedToOfflineEntitlements
  }

  set offlineFeaturesUrl(offlineFeaturesUrl: string) {
    this.sureContent.offlineFeaturesUrl = offlineFeaturesUrl
  }

  set offlineKey(offlineKey: string) {
    this.sureContent.offlineKey = offlineKey
  }
}
