import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionCancelledEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
}
