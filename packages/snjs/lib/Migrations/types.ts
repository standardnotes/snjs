import { SNSessionManager } from '../Services/Session/SessionManager'
import { ApplicationIdentifier } from '@standardnotes/applications'
import { ItemManager } from '@Lib/services/Items/ItemManager'
import { Environment } from '../Application/platforms'
import { SNStorageService } from '@Lib/Services/Storage/StorageService'
import { SNProtocolService } from '../Services/Protocol/ProtocolService'
import { DeviceInterface, InternalEventBusInterface } from '@standardnotes/services'
import { ChallengeService, SNSingletonManager, SNFeaturesService } from '@Lib/Services'

/** Services that the migration service needs to function */
export type MigrationServices = {
  protocolService: SNProtocolService
  deviceInterface: DeviceInterface
  storageService: SNStorageService
  challengeService: ChallengeService
  sessionManager: SNSessionManager
  itemManager: ItemManager
  singletonManager: SNSingletonManager
  featuresService: SNFeaturesService
  environment: Environment
  /** The application identifier */
  identifier: ApplicationIdentifier
  internalEventBus: InternalEventBusInterface,
}
