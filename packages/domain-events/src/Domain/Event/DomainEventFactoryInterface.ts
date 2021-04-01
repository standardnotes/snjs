import { ItemsSyncedEvent } from './ItemsSyncedEvent'
import { UserRegisteredEvent } from './UserRegisteredEvent'

export interface DomainEventFactoryInterface {
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent
  createItemsSyncedEvent(userUuid: string, extensionsServerUrl: string, extensionUuid: string, itemUuids: Array<string>, forceMute: boolean): ItemsSyncedEvent
}
