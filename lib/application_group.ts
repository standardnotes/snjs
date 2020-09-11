import { RawStorageKey } from '@Lib/storage_keys';
import { removeFromArray, findInArray } from '@Lib/utils';
import { UuidString } from './types';
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

  private findPrimaryDescriptor() {
    for (const key of Object.keys(this.descriptorRecord)) {
      const descriptor = this.descriptorRecord[key]!;
      if (descriptor.primary) {
        return descriptor;
      }
    }
  }

  /** @callback */
  onApplicationDeinit = (application: SNApplication) => {
    removeFromArray(this.applications, application);
    if (this.primaryApplication === application) {
      (this.primaryApplication as any) = undefined;
    }
    if (this.applications.length === 0) {
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

  private async setPrimaryApplication(application: SNApplication) {
    if(!this.applications.includes(application)) {
      throw Error('Application must be inserted before attempting to switch to it');
    }
    const changed = this.primaryApplication && this.primaryApplication !== application;
    this.primaryApplication = application;
    if (changed) {
      const descriptor = this.descriptorForApplication(application);
      descriptor.primary = true;
      const currentPrimaryDescriptor = this.findPrimaryDescriptor();
      if (currentPrimaryDescriptor) {
        currentPrimaryDescriptor.primary = false;
      }
      this.notifyObserversOfAppChange();
      await this.persistDescriptors();
    }
  }

  private async persistDescriptors() {
    this.deviceInterface!.setRawStorageValue(
      RawStorageKey.DescriptorRecord,
      JSON.stringify(this.descriptorRecord)
    );
  }

  private descriptorForApplication(application: SNApplication) {
    return this.descriptorRecord[application.identifier];
  }

  public async addNewApplication(label?: string) {
    const identifier = await Uuid.GenerateUuid();
    const descriptor = {
      identifier: identifier,
      label: label || identifier,
      primary: !this.primaryApplication
    } as ApplicationDescriptor;
    const application = this.buildApplication(descriptor);
    this.applications.push(application);
    this.descriptorRecord[identifier] = descriptor;
    await this.setPrimaryApplication(application);
    await this.persistDescriptors();
  }

  private buildApplication(descriptor: ApplicationDescriptor) {
    const application = this.callback.applicationCreator(descriptor, this.deviceInterface);
    application.setOnDeinit(this.onApplicationDeinit);
    return application;
  }
}
