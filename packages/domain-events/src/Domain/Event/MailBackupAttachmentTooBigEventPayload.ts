export interface MailBackupAttachmentTooBigEventPayload {
  allowedSize: string
  attachmentSize: string
  muteEmailsSettingUuid: string
  email: string
}
