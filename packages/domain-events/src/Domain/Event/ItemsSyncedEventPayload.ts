export interface ItemsSyncedEventPayload {
  userUuid: string
  extensionsServerUrl: string
  extensionId: string
  itemUuids: Array<string>
  forceMute: boolean
}
