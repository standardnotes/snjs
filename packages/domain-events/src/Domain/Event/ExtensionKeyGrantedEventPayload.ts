import { SubscriptionName } from '@standardnotes/auth'

export interface ExtensionKeyGrantedEventPayload {
  userEmail: string
  extensionKey: string
  timestamp: number
  offline: boolean
  origin: 'create-user' | 'update-subscription'
  subscriptionName: SubscriptionName | null
  offlineFeaturesToken: string
  pricePaid: string
  billingFrequency: number
}
