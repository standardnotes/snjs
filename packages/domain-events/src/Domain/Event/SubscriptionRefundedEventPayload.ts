import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionRefundedEventPayload {
  userEmail: string
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
}
