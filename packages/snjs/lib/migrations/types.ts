import { SNSessionManager } from '../services/Api/SessionManager'
import { ApplicationIdentifier } from '@standardnotes/applications'
import { ItemManager } from '@Lib/services/ItemManager'
import { Environment } from './../platforms'
import { SNStorageService } from '@Lib/services/StorageService'
import { SNProtocolService } from '../services/ProtocolService'
import { DeviceInterface } from '@standardnotes/services'
import { ChallengeService, SNSingletonManager, SNFeaturesService } from '@Lib/services'

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
}
