import { ErrorObject } from '@standardnotes/common'

export type SetOfflineFeaturesFunctionResponse = ErrorObject | undefined

export type OfflineSubscriptionEntitlements = {
  featuresUrl: string
  extensionKey: string
}
export const enum FeaturesEvent {
  UserRolesChanged = 'UserRolesChanged',
  FeaturesUpdated = 'FeaturesUpdated',
}

export const enum FeatureStatus {
  NoUserSubscription = 'NoUserSubscription',
  NotInCurrentPlan = 'NotInCurrentPlan',
  InCurrentPlanButExpired = 'InCurrentPlanButExpired',
  Entitled = 'Entitled',
}
