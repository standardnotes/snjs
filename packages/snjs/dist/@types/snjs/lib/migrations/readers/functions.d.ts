import { ApplicationIdentifier } from './../../types';
import { Environment } from '../../../../platforms';
import { DeviceInterface } from '../../../../device_interface';
import { StorageReader } from './reader';
export declare function CreateReader(version: string, deviceInterface: DeviceInterface, identifier: ApplicationIdentifier, environment: Environment): StorageReader;
