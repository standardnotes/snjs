import { SubscriptionName } from '@standardnotes/auth'
import { FeatureDescription } from '@standardnotes/features'

export interface ExtensionKeyGrantedEventPayload {
  userEmail: string
  extensionKey: string
  timestamp: number
  offline: boolean
  origin: 'create-user' | 'update-subscription'
  subscriptionName: SubscriptionName | null
  subscriptionFeatures: FeatureDescription[] | null
  offlineFeaturesToken: string | null
  payAmount: number | null
  billingEveryNMonths: number | null
  activeUntil: string | null
}
