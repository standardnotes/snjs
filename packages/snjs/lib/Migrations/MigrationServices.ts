import { SNSessionManager } from '../Services/Session/SessionManager'
import { ApplicationIdentifier } from '@standardnotes/common'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { Environment } from '../Application/Platforms'
import { SNStorageService } from '@Lib/Services/Storage/StorageService'
import { EncryptionService } from '@standardnotes/encryption'
import { DeviceInterface, InternalEventBusInterface } from '@standardnotes/services'
import { ChallengeService, SNSingletonManager, SNFeaturesService } from '@Lib/Services'

/** Services that the migration service needs to function */
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
