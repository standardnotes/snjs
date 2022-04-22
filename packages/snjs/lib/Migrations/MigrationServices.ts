import { SNSessionManager } from '../Services/Session/SessionManager'
import { ApplicationIdentifier } from '@standardnotes/common'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { SNStorageService } from '@Lib/Services/Storage/StorageService'
import { EncryptionService } from '@standardnotes/encryption'
import { DeviceInterface, InternalEventBusInterface, Environment } from '@standardnotes/services'
import { ChallengeService, SNSingletonManager, SNFeaturesService } from '@Lib/Services'

export type MigrationServices = {
  protocolService: EncryptionService
  deviceInterface: DeviceInterface
  storageService: SNStorageService
  challengeService: ChallengeService
  sessionManager: SNSessionManager
  itemManager: ItemManager
  singletonManager: SNSingletonManager
  featuresService: SNFeaturesService
  environment: Environment
  identifier: ApplicationIdentifier
  internalEventBus: InternalEventBusInterface
}
