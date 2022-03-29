import { SubscriptionName } from '@standardnotes/common'

export interface SharedSubscriptionInvitationCreatedEventPayload {
  inviterEmail: string
  inviterSubscriptionId: number
  inviterSubscriptionName: SubscriptionName
  inviterSubscriptionExpiresAt: number
  inviteeIdentifier: string
  inviteeIdentifierType: 'email' | 'hash'
  sharedSubscriptionInvitationUuid: string
}
