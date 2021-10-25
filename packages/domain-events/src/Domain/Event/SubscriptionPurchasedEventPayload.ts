import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionPurchasedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
  offline: boolean
}
