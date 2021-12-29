import { SNSessionManager } from './../services/api/session_manager';
import { ApplicationIdentifier } from './../types';
import { ItemManager } from '../services/item_manager';
import { Environment } from './../platforms';
import { SNStorageService } from '../services/storage_service';
import { SNProtocolService } from './../services/protocol_service';
import { DeviceInterface } from '../device_interface';
import { ChallengeService, SNSingletonManager, SNFeaturesService } from '../services';
/** Services that the migration service needs to function */
export declare type MigrationServices = {
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
