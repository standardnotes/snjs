export interface MailBackupAttachmentTooBigEventPayload {
  allowedSize: string
  attachmentSize: string
  extensionSettingUuid: string
  email: string
}
