import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionPurchasedEventPayload {
  userEmail: string
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
}
