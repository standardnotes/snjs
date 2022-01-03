export interface CloudBackupRequestedEventPayload {
  cloudProvider: 'DROPBOX' | 'ONE_DRIVE' | 'GOOGLE_DRIVE',
  userUuid: string
  userHasEmailsMuted: boolean
  muteEmailsSettingUuid: string
}
