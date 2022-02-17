export interface UserSignedInEventPayload {
  userUuid: string
  userEmail: string
  signInAlertEnabled: boolean,
  device: string
  browser: string
}
