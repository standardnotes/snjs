import { SNItem } from '../Item/Item'

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
