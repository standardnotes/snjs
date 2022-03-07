import { FeatureStatus, SetOfflineFeaturesFunctionResponse } from './Types'
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features'
import { SNComponent } from '../../models/app/component'
import { RoleName } from '@standardnotes/common'

export interface FeaturesClientInterface {
  downloadExternalFeature(urlOrCode: string): Promise<SNComponent | undefined>

  getFeature(featureId: FeatureIdentifier): FeatureDescription | undefined

  getFeatureStatus(featureId: FeatureIdentifier): FeatureStatus

  hasMinimumRole(role: RoleName): boolean

  setOfflineFeaturesCode(code: string): Promise<SetOfflineFeaturesFunctionResponse>

  hasOfflineRepo(): boolean

  deleteOfflineFeatureRepo(): Promise<void>

  isThirdPartyFeature(identifier: string): boolean

  toggleExperimentalFeature(identifier: FeatureIdentifier): void

  getExperimentalFeatures(): FeatureIdentifier[]

  getEnabledExperimentalFeatures(): FeatureIdentifier[]

  enableExperimentalFeature(identifier: FeatureIdentifier): void

  disableExperimentalFeature(identifier: FeatureIdentifier): void

  isExperimentalFeatureEnabled(feature: FeatureIdentifier): boolean
}
