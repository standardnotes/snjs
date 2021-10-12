import { SubscriptionName } from '@standardnotes/auth'

export interface SubscriptionExpiredEventPayload {
  userEmail: string
  subscriptionName: SubscriptionName
  timestamp: number
  offline: boolean
}
