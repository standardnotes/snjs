import { SNSessionManager } from './../services/api/session_manager';
import { ApplicationIdentifier } from './../types';
import { ItemManager } from '@Services/item_manager';
import { Environment } from './../platforms';
import { SNStorageService } from '@Services/storage_service';
import { SNProtocolService } from './../services/protocol_service';
import { DeviceInterface } from '../device_interface';
import { ChallengeService, SNSingletonManager, SNFeaturesService } from '@Lib/services';

/** Services that the migration service needs to function */
export type MigrationServices = {
  protocolService: SNProtocolService;
  deviceInterface: DeviceInterface;
  storageService: SNStorageService;
  challengeService: ChallengeService;
  sessionManager: SNSessionManager;
  itemManager: ItemManager;
  singletonManager: SNSingletonManager;
  featuresService: SNFeaturesService;
  environment: Environment;
  /** The application identifier */
  identifier: ApplicationIdentifier;
};
