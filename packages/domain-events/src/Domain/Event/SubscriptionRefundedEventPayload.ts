import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionRefundedEventPayload {
  userEmail: string
  fromSubscriptionName: SubscriptionName
  toSubscriptionName: SubscriptionName
  timestamp: number
}
