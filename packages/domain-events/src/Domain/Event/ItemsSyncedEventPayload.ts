export interface ItemsSyncedEventPayload {
  userUuid: string
  extensionsServerUrl: string
  extensionUuid: string
  itemUuids: Array<string>
  forceMute: boolean
}
