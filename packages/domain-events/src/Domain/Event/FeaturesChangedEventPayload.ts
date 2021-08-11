import { FeatureIdentifier } from '@standardnotes/features'

export interface FeaturesChangedEventPayload {
  userUuid: string
  email: string
  features: FeatureIdentifier[],
  timestamp: number
}
