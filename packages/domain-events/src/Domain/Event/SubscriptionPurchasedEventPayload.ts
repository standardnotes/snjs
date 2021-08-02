import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionPurchasedEventPayload {
  userEmail: string
  fromSubscriptionName: SubscriptionName
  toSubscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
}
