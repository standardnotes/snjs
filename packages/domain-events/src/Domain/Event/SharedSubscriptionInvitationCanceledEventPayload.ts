export interface SharedSubscriptionInvitationCanceledEventPayload {
  inviterEmail: string
  inviterSubscriptionId: number
  inviteeIdentifier: string
  inviteeIdentifierType: 'email' | 'hash'
  sharedSubscriptionInvitationUuid: string
}
