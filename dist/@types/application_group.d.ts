import { UuidString } from './types';
import { SNApplication } from './application';
import { PureService } from './services/pure_service';
import { DeviceInterface } from './device_interface';
export declare type ApplicationDescriptor = {
    identifier: string | UuidString;
    userUuid?: UuidString;
    label: string;
    /** Whether the application is the primary user-facing selected application */
    primary: boolean;
};
export declare type DescriptorRecord = Record<string, ApplicationDescriptor>;
declare type AppGroupCallback = {
    applicationCreator: (descriptor: ApplicationDescriptor, deviceInterface: DeviceInterface) => SNApplication;
};
declare type AppGroupChangeCallback = () => void;
/**
 * The application service is responsible of setting the application to be used by
 * the DeviceInterface.
 */
export declare class SNApplicationGroup extends PureService {
    deviceInterface: DeviceInterface;
    primaryApplication: SNApplication;
    private descriptorRecord;
    private changeObservers;
    callback: AppGroupCallback;
    private applications;
    constructor(deviceInterface: DeviceInterface);
    /**
     * Creates a new application if necessary. If not, use an existing one.
     */
    initialize(callback: AppGroupCallback): Promise<void>;
    /**
     * Run when the application is launched for the first time
     * and there is not yet a descriptor record
     */
    private createDescriptorRecord;
    getApplications(): SNApplication[];
    private findPrimaryDescriptor;
    /** @callback */
    onApplicationDeinit: (application: SNApplication) => void;
    /**
     * Notifies observer when the primary application has changed.
     * Any application which is no longer active is destroyed, and
     * must be removed from the interface.
     */
    addApplicationChangeObserver(callback: AppGroupChangeCallback): () => void;
    private notifyObserversOfAppChange;
    private setPrimaryApplication;
    private persistDescriptors;
    private descriptorForApplication;
    addNewApplication(label?: string): Promise<void>;
    private buildApplication;
}
export {};
