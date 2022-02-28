import { RawStorageKey } from '@Lib/storage_keys'
import { removeFromArray } from '@standardnotes/utils'
import { DeinitSource, UuidString } from './types'
import { SNApplication } from './application'
import { AbstractService, DeviceInterface } from '@standardnotes/services'
import { UuidGenerator } from '@standardnotes/utils'

export type ApplicationDescriptor = {
  identifier: string | UuidString;
  label: string;
  /** Whether the application is the primary user-facing selected application */
  primary: boolean;
};

export type DescriptorRecord = Record<string, ApplicationDescriptor>;

type AppGroupCallback = {
  applicationCreator: (
    descriptor: ApplicationDescriptor,
    deviceInterface: DeviceInterface
  ) => SNApplication;
};

type AppGroupChangeCallback = () => void;

export class SNApplicationGroup extends AbstractService {
  public primaryApplication?: SNApplication
  private descriptorRecord!: DescriptorRecord
  private changeObservers: AppGroupChangeCallback[] = []
  callback!: AppGroupCallback
  private applications: SNApplication[] = []

  constructor(public deviceInterface: DeviceInterface) {
    super()
  }

  deinit() {
    super.deinit()
    this.deviceInterface.deinit();
    (this.deviceInterface as any) = undefined
  }

  public async initialize(callback: AppGroupCallback): Promise<void> {
    this.callback = callback
    this.descriptorRecord = (await this.deviceInterface.getJsonParsedRawStorageValue(
      RawStorageKey.DescriptorRecord
    )) as DescriptorRecord

    if (!this.descriptorRecord) {
      await this.createDescriptorRecord()
    }

    const primaryDescriptor = this.findPrimaryDescriptor()
    if (!primaryDescriptor) {
      throw Error(
        'No primary application descriptor found. Ensure migrations have been run.'
      )
    }

    const application = this.buildApplication(primaryDescriptor)
    this.applications.push(application)
    this.setPrimaryApplication(application, false)
  }

  private async createDescriptorRecord() {
    /** The identifier 'standardnotes' is used because this was the
     * database name of Standard Notes web/desktop */
    const identifier = 'standardnotes'
    const descriptorRecord: DescriptorRecord = {
      [identifier]: {
        identifier: identifier,
        label: 'Main Application',
        primary: true,
      },
    }
    this.deviceInterface.setRawStorageValue(
      RawStorageKey.DescriptorRecord,
      JSON.stringify(descriptorRecord)
    )
    this.descriptorRecord = descriptorRecord
    this.persistDescriptors()
  }

  public getApplications() {
    return this.applications
  }

  public getDescriptors() {
    return Object.values(this.descriptorRecord)
  }

  private findPrimaryDescriptor() {
    for (const descriptor of this.getDescriptors()) {
      if (descriptor.primary) {
        return descriptor
      }
    }
  }

  /** @callback */
  onApplicationDeinit = (application: SNApplication, source: DeinitSource) => {
    /** If we are initiaitng this unloading via function below,
     * we don't want any side-effects */
    const sideffects = source !== DeinitSource.AppGroupUnload
    if (this.primaryApplication === application) {
      this.primaryApplication = undefined
    }

    removeFromArray(this.applications, application)

    if (source === DeinitSource.SignOut) {
      this.removeDescriptor(this.descriptorForApplication(application))
      if (sideffects) {
        /** If there are no more descriptors (all accounts have been signed out),
         * create a new blank slate app */
        const descriptors = this.getDescriptors()
        if (descriptors.length === 0) {
          return this.addNewApplication()
        } else {
          return this.loadApplicationForDescriptor(descriptors[0])
        }
      }
    } else if (source === DeinitSource.Lock && sideffects) {
      /** Recreate the same application from scratch */
      const descriptor = this.descriptorForApplication(application)
      return this.loadApplicationForDescriptor(descriptor)
    }
  }

  /**
   * Notifies observer when the primary application has changed.
   * Any application which is no longer active is destroyed, and
   * must be removed from the interface.
   */
  public addApplicationChangeObserver(
    callback: AppGroupChangeCallback
  ): () => void {
    this.changeObservers.push(callback)
    if (this.primaryApplication) {
      callback()
    }
    return () => {
      removeFromArray(this.changeObservers, callback)
    }
  }

  private notifyObserversOfAppChange() {
    for (const observer of this.changeObservers) {
      observer()
    }
  }

  public async setPrimaryApplication(
    application: SNApplication,
    persist = true
  ): Promise<void> {
    if (this.primaryApplication === application) {
      return
    }

    if (!this.applications.includes(application)) {
      throw Error(
        'Application must be inserted before attempting to switch to it'
      )
    }

    if (this.primaryApplication) {
      this.primaryApplication.deinit(DeinitSource.AppGroupUnload)
    }

    this.primaryApplication = application

    const descriptor = this.descriptorForApplication(application)
    this.setDescriptorAsPrimary(descriptor)

    this.notifyObserversOfAppChange()

    if (persist) {
      await this.persistDescriptors()
    }
  }

  setDescriptorAsPrimary(primaryDescriptor: ApplicationDescriptor) {
    for (const descriptor of this.getDescriptors()) {
      descriptor.primary = descriptor === primaryDescriptor
    }
  }

  private async persistDescriptors() {
    this.deviceInterface!.setRawStorageValue(
      RawStorageKey.DescriptorRecord,
      JSON.stringify(this.descriptorRecord)
    )
  }

  public async renameDescriptor(
    descriptor: ApplicationDescriptor,
    label: string
  ) {
    descriptor.label = label
    await this.persistDescriptors()
  }

  public removeDescriptor(descriptor: ApplicationDescriptor) {
    delete this.descriptorRecord[descriptor.identifier]
    return this.persistDescriptors()
  }

  private descriptorForApplication(application: SNApplication) {
    return this.descriptorRecord[application.identifier]
  }

  public async addNewApplication(label?: string) {
    const identifier = await UuidGenerator.GenerateUuid()
    const index = this.getDescriptors().length + 1
    const descriptor: ApplicationDescriptor = {
      identifier: identifier,
      label: label || `Application ${index}`,
      primary: false,
    }
    const application = this.buildApplication(descriptor)
    this.applications.push(application)
    this.descriptorRecord[identifier] = descriptor
    await this.setPrimaryApplication(application)
    await this.persistDescriptors()
  }

  private applicationForDescriptor(descriptor: ApplicationDescriptor) {
    return this.applications.find(
      (app) => app.identifier === descriptor.identifier
    )
  }

  public async loadApplicationForDescriptor(descriptor: ApplicationDescriptor) {
    let application = this.applicationForDescriptor(descriptor)
    if (!application) {
      application = this.buildApplication(descriptor)
      this.applications.push(application)
    }
    await this.setPrimaryApplication(application)
  }

  private buildApplication(descriptor: ApplicationDescriptor) {
    const application = this.callback.applicationCreator(
      descriptor,
      this.deviceInterface
    )
    application.setOnDeinit(this.onApplicationDeinit)
    return application
  }
}
