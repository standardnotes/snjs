import { Environment } from './../platforms';
import { PayloadManager } from './../services/model_manager';
import { SNStorageService } from '@Services/storage_service';
import { SNProtocolService } from './../services/protocol_service';
import { DeviceInterface } from '../device_interface';

/** Services that the migration service needs to function */
export type MigrationServices = {
  protocolService: SNProtocolService,
  deviceInterface: DeviceInterface,
  storageService: SNStorageService,
  modelManager: PayloadManager,
  environment: Environment
  namespace: string
}