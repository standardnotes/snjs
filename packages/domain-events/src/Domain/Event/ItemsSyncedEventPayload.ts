export interface ItemsSyncedEventPayload {
  userUuid: string
  extensionUrl: string
  extensionId: string
  itemUuids: Array<string>
  forceMute: boolean
}
