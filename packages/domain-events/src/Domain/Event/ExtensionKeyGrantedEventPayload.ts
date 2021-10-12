import { SubscriptionName } from '@standardnotes/auth'

export interface ExtensionKeyGrantedEventPayload {
  userEmail: string
  extensionKey: string
  timestamp: number
  subscriptionName: SubscriptionName
  offline: boolean
  origin: 'create-user' | 'update-subscription'
}
