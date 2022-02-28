import { ItemMutator, SNItem } from '@Models/core/item'

export interface FeatureRepoContent {
  migratedToUserSetting?: boolean
  migratedToOfflineEntitlements?: boolean
  offlineFeaturesUrl?: string
  offlineKey?: string
}

export class SNFeatureRepo extends SNItem {
  public get migratedToUserSetting(): boolean {
    return this.payload.safeContent.migratedToUserSetting
  }

  public get migratedToOfflineEntitlements(): boolean {
    return this.payload.safeContent.migratedToOfflineEntitlements
  }

  public get onlineUrl(): string {
    return this.payload.safeContent.url
  }

  get offlineFeaturesUrl(): string {
    return this.payload.safeContent.offlineFeaturesUrl
  }

  get offlineKey(): string {
    return this.payload.safeContent.offlineKey
  }
}

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
