import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionReassignedEventPayload {
  userEmail: string
  subscriptionName: SubscriptionName
  subscriptionExpiresAt: number
  timestamp: number
}
