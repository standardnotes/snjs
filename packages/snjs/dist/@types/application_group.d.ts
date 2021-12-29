import { DeinitSource, UuidString } from './types';
import { SNApplication } from './application';
import { PureService } from './services/pure_service';
import { DeviceInterface } from './device_interface';
export declare type ApplicationDescriptor = {
    identifier: string | UuidString;
    label: string;
    /** Whether the application is the primary user-facing selected application */
    primary: boolean;
};
export declare type DescriptorRecord = Record<string, ApplicationDescriptor>;
declare type AppGroupCallback = {
    applicationCreator: (descriptor: ApplicationDescriptor, deviceInterface: DeviceInterface) => SNApplication;
};
declare type AppGroupChangeCallback = () => void;
export declare class SNApplicationGroup extends PureService {
    deviceInterface: DeviceInterface;
    primaryApplication?: SNApplication;
    private descriptorRecord;
    private changeObservers;
    callback: AppGroupCallback;
    private applications;
    constructor(deviceInterface: DeviceInterface);
    deinit(): void;
    initialize(callback: AppGroupCallback): Promise<void>;
    private createDescriptorRecord;
    getApplications(): SNApplication[];
    getDescriptors(): ApplicationDescriptor[];
    private findPrimaryDescriptor;
    /** @callback */
    onApplicationDeinit: (application: SNApplication, source: DeinitSource) => Promise<void> | undefined;
    /**
     * Notifies observer when the primary application has changed.
     * Any application which is no longer active is destroyed, and
     * must be removed from the interface.
     */
    addApplicationChangeObserver(callback: AppGroupChangeCallback): () => void;
    private notifyObserversOfAppChange;
    setPrimaryApplication(application: SNApplication, persist?: boolean): Promise<void>;
    setDescriptorAsPrimary(primaryDescriptor: ApplicationDescriptor): void;
    private persistDescriptors;
    renameDescriptor(descriptor: ApplicationDescriptor, label: string): Promise<void>;
    removeDescriptor(descriptor: ApplicationDescriptor): Promise<void>;
    private descriptorForApplication;
    addNewApplication(label?: string): Promise<void>;
    private applicationForDescriptor;
    loadApplicationForDescriptor(descriptor: ApplicationDescriptor): Promise<void>;
    private buildApplication;
}
export {};
