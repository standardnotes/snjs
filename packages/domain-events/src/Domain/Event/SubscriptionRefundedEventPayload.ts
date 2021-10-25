import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionRefundedEventPayload {
  userEmail: string
  subscriptionId: number
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
}
