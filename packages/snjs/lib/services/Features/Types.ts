import { ClientDisplayableError } from '@Lib/strings/ClientError'

export type SetOfflineFeaturesFunctionResponse = ClientDisplayableError | undefined

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
