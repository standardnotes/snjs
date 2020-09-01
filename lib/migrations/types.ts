import { ItemManager } from '@Services/item_manager';
import { Environment } from './../platforms';
import { SNStorageService } from '@Services/storage_service';
import { SNProtocolService } from './../services/protocol_service';
import { DeviceInterface } from '../device_interface';
import { ChallengeService } from '@Lib/services';
import { SNNamespaceService } from '@Lib/services/namespace_service';

/** Services that the migration service needs to function */
export type MigrationServices = {
  protocolService: SNProtocolService,
  deviceInterface: DeviceInterface,
  storageService: SNStorageService,
  challengeService: ChallengeService,
  itemManager: ItemManager,
  environment: Environment
  namespaceService: SNNamespaceService
}
