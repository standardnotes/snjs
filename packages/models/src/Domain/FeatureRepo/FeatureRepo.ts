import { SNItem } from '../Item/Item'
import { ItemContent } from '../Item/ItemContent'

export interface FeatureRepoContent extends ItemContent {
  migratedToUserSetting?: boolean
  migratedToOfflineEntitlements?: boolean
  offlineFeaturesUrl?: string
  offlineKey?: string
  url?: string
}

export class SNFeatureRepo extends SNItem<FeatureRepoContent> {
  public get migratedToUserSetting(): boolean {
    return this.payload.safeContent.migratedToUserSetting || false
  }

  public get migratedToOfflineEntitlements(): boolean {
    return this.payload.safeContent.migratedToOfflineEntitlements || false
  }

  public get onlineUrl(): string | undefined {
    return this.payload.safeContent.url
  }

  get offlineFeaturesUrl(): string | undefined {
    return this.payload.safeContent.offlineFeaturesUrl
  }

  get offlineKey(): string | undefined {
    return this.payload.safeContent.offlineKey
  }
}
