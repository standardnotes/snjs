import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionRenewedEventPayload {
  userEmail: string
  extensionKey: string
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
}
