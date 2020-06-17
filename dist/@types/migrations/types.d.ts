import { ItemManager } from '../services/item_manager';
import { Environment } from './../platforms';
import { SNStorageService } from '../services/storage_service';
import { SNProtocolService } from './../services/protocol_service';
import { DeviceInterface } from '../device_interface';
import { ChallengeService } from '../services';
/** Services that the migration service needs to function */
export declare type MigrationServices = {
    protocolService: SNProtocolService;
    deviceInterface: DeviceInterface;
    storageService: SNStorageService;
    challengeService: ChallengeService;
    itemManager: ItemManager;
    environment: Environment;
    namespace: string;
};
