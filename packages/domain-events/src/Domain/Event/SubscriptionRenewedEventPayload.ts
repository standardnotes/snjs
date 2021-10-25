import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionRenewedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
  offline: boolean
}
