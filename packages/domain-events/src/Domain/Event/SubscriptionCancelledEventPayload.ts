import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionCancelledEventPayload {
  userEmail: string
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
}
