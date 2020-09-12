import { RawStorageKey } from '@Lib/storage_keys';
import { removeFromArray, findInArray } from '@Lib/utils';
import { UuidString, DeinitSource } from './types';
import { SNApplication } from './application';
import { PureService } from '@Services/pure_service';
import { DeviceInterface } from '@Lib/device_interface';
import { Uuid } from '@Lib/uuid';

export type ApplicationDescriptor = {
  identifier: string | UuidString,
  // userUuid?: UuidString,
  label: string,
  /** Whether the application is the primary user-facing selected application */
  primary: boolean,
}

export type DescriptorRecord = Record<string, ApplicationDescriptor>

type AppGroupCallback = {
  applicationCreator: (
    descriptor: ApplicationDescriptor,
    deviceInterface: DeviceInterface
  ) => SNApplication
}

type AppGroupChangeCallback = () => void

export class SNApplicationGroup extends PureService {
  public primaryApplication!: SNApplication
  private descriptorRecord!: DescriptorRecord
  private changeObservers: AppGroupChangeCallback[] = []
  callback!: AppGroupCallback
  private applications: SNApplication[] = []

  constructor(public deviceInterface: DeviceInterface) {
    super();
  }

  deinit() {
    super.deinit();
    this.deviceInterface.deinit();
    (this.deviceInterface as any) = undefined;
  }

  public async initialize(callback: AppGroupCallback) {
    this.callback = callback;
    this.descriptorRecord = (
      await this.deviceInterface!.getJsonParsedRawStorageValue(RawStorageKey.DescriptorRecord)
    ) as DescriptorRecord;
    if (!this.descriptorRecord) {
      this.descriptorRecord = await this.createDescriptorRecord();
    }
    const primaryDescriptor = this.findPrimaryDescriptor();
    if (!primaryDescriptor) {
      throw Error('No primary application descriptor found. Ensure migrations have been run.')
    }
    const application = this.buildApplication(primaryDescriptor);
    this.applications.push(application);
    this.setPrimaryApplication(application);
  }

  private async createDescriptorRecord() {
    const descriptorRecord = {} as DescriptorRecord;
    const descriptor = {
      /** The identifier 'standardnotes' is used because this was the database name of
       * Standard Notes web/desktop */
      identifier: "standardnotes",
      label: 'Main Application',
      primary: true
    } as ApplicationDescriptor;
    descriptorRecord[descriptor.identifier] = descriptor;
    this.deviceInterface.setRawStorageValue(
      RawStorageKey.DescriptorRecord,
      JSON.stringify(descriptorRecord)
    );
    return descriptorRecord;
  }

  public getApplications() {
    return this.applications;
  }

  public getDescriptors() {
    return Object.keys(this.descriptorRecord).map(key => this.descriptorRecord[key]!);
  }

  private findPrimaryDescriptor() {
    for (const key of Object.keys(this.descriptorRecord)) {
      const descriptor = this.descriptorRecord[key]!;
      if (descriptor.primary) {
        return descriptor;
      }
    }
  }

  /** @callback */
  onApplicationDeinit = (application: SNApplication, source: DeinitSource) => {
    removeFromArray(this.applications, application);
    if (source === DeinitSource.SignOut) {
      this.removeDescriptor(this.descriptorForApplication(application));
    }
    const descriptors = this.getDescriptors();
    if (descriptors.length === 0) {
      this.addNewApplication();
    }
  }

  /**
   * Notifies observer when the primary application has changed.
   * Any application which is no longer active is destroyed, and
   * must be removed from the interface.
   */
  public addApplicationChangeObserver(callback: AppGroupChangeCallback) {
    this.changeObservers.push(callback);
    if (this.primaryApplication) {
      callback();
    }
    return () => {
      removeFromArray(this.changeObservers, callback);
    }
  }

  private notifyObserversOfAppChange() {
    for (const observer of this.changeObservers) {
      observer();
    }
  }

  public async setPrimaryApplication(application: SNApplication) {
    if (!this.applications.includes(application)) {
      throw Error('Application must be inserted before attempting to switch to it');
    }
    /** If primaryApplication is presently null, we are setting it for the first time,
     * and do not need to persist any descriptor changes */
    const statusChange = this.primaryApplication && this.primaryApplication !== application;
    const currentPrimary = this.primaryApplication;
    if(currentPrimary) {
      await this.unloadApplication(currentPrimary);
    }
    this.primaryApplication = application;
    this.notifyObserversOfAppChange();
    if (statusChange) {
      const currentPrimaryDescriptor = this.findPrimaryDescriptor();
      const descriptor = this.descriptorForApplication(application);
      descriptor.primary = true;
      if (currentPrimaryDescriptor) {
        currentPrimaryDescriptor.primary = false;
      }
      await this.persistDescriptors();
    }
  }

  public async unloadApplication(application: SNApplication) {
    await application.lock();
    removeFromArray(this.applications, application);
  }

  private async persistDescriptors() {
    this.deviceInterface!.setRawStorageValue(
      RawStorageKey.DescriptorRecord,
      JSON.stringify(this.descriptorRecord)
    );
  }

  public async renameDescriptor(descriptor: ApplicationDescriptor, label: string) {
    descriptor.label = label;
    await this.persistDescriptors();
  }

  public async removeDescriptor(descriptor: ApplicationDescriptor) {
    delete this.descriptorRecord[descriptor.identifier];
    await this.persistDescriptors();
  }

  private descriptorForApplication(application: SNApplication) {
    return this.descriptorRecord[application.identifier];
  }

  public async addNewApplication(label?: string) {
    const identifier = await Uuid.GenerateUuid();
    const index = this.getDescriptors().length + 1;
    const descriptor = {
      identifier: identifier,
      label: label || `Application ${index}`,
      primary: !this.primaryApplication
    } as ApplicationDescriptor;
    const application = this.buildApplication(descriptor);
    this.applications.push(application);
    this.descriptorRecord[identifier] = descriptor;
    await this.setPrimaryApplication(application);
    await this.persistDescriptors();
  }

  private applicationForDescriptor(descriptor: ApplicationDescriptor) {
    return this.applications.find(app => app.identifier === descriptor.identifier);
  }

  public async loadApplicationForDescriptor(descriptor: ApplicationDescriptor) {
    let application = this.applicationForDescriptor(descriptor);
    if (!application) {
      application = this.buildApplication(descriptor);
      this.applications.push(application);
    }
    await this.setPrimaryApplication(application);
  }

  private buildApplication(descriptor: ApplicationDescriptor) {
    const application = this.callback.applicationCreator(descriptor, this.deviceInterface);
    application.setOnDeinit(this.onApplicationDeinit);
    return application;
  }
}
