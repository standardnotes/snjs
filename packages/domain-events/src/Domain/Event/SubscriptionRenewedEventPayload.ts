import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionRenewedEventPayload {
  userEmail: string
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
}
