import { PureService } from './pure_service';
import { DeviceInterface } from '../device_interface';
import { UuidString } from './../types';
export declare type SNNamespace = {
    identifier: string | UuidString;
    userUuid?: UuidString;
    label: string;
    isDefault: boolean;
};
/**
 * The namespace service is responsible of setting the namespace to be used by
 * the DeviceInterface.
 */
export declare class SNNamespaceService extends PureService {
    private namespace?;
    constructor(deviceInterface: DeviceInterface);
    private getNamespaces;
    private setNamespaces;
    private getDefaultNamespace;
    private pushNamespace;
    private switchToNamespace;
    /**
     * Creates a new namespace if necessary. If not, use an existing one.
     */
    initialize(): Promise<void>;
    createNamespace(isDefault?: boolean, identifier?: string, label?: string): Promise<void>;
    /**
     * Gets the current namespace in use.
     */
    getCurrentNamespace(): SNNamespace;
}
