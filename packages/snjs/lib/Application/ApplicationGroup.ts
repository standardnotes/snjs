import { UuidString, DeinitSource } from '../Types'
import { SNApplication } from './Application'
import {
  AbstractService,
  DeviceInterface,
  InternalEventBus,
  InternalEventBusInterface,
  RawStorageKey,
} from '@standardnotes/services'
import { UuidGenerator, removeFromArray } from '@standardnotes/utils'

export type ApplicationDescriptor = {
  identifier: string | UuidString
  label: string
  /** Whether the application is the primary user-facing selected application */
  primary: boolean
}

export type DescriptorRecord = Record<string, ApplicationDescriptor>

type AppGroupCallback = {
  applicationCreator: (descriptor: ApplicationDescriptor, deviceInterface: DeviceInterface) => SNApplication
}

type AppGroupChangeCallback = () => void

export class SNApplicationGroup extends AbstractService {
  public primaryApplication?: SNApplication
  private descriptorRecord!: DescriptorRecord
  private changeObservers: AppGroupChangeCallback[] = []
  callback!: AppGroupCallback
  private applications: SNApplication[] = []

  constructor(public deviceInterface: DeviceInterface, internalEventBus?: InternalEventBusInterface) {
    if (internalEventBus === undefined) {
      internalEventBus = new InternalEventBus()
    }

    super(internalEventBus)
  }

  override deinit() {
    super.deinit()
    this.deviceInterface.deinit()
    ;(this.deviceInterface as unknown) = undefined
  }

  public async initialize(callback: AppGroupCallback): Promise<void> {
    this.callback = callback
    this.descriptorRecord = (await this.deviceInterface.getJsonParsedRawStorageValue(
      RawStorageKey.DescriptorRecord,
    )) as DescriptorRecord

    if (!this.descriptorRecord) {
      await this.createDescriptorRecord()
    }

    const primaryDescriptor = this.findPrimaryDescriptor()
    if (!primaryDescriptor) {
      throw Error('No primary application descriptor found. Ensure migrations have been run.')
    }

    const application = this.buildApplication(primaryDescriptor)
    this.applications.push(application)

    void this.setPrimaryApplication(application, false)
  }

  private createDescriptorRecord() {
    /** The identifier 'standardnotes' is used because this was the
     * database name of Standard Notes web/desktop */
    const identifier = 'standardnotes'
    const descriptorRecord: DescriptorRecord = {
      [identifier]: {
        identifier: identifier,
        label: 'Main Workspace',
        primary: true,
      },
    }

    void this.deviceInterface.setRawStorageValue(RawStorageKey.DescriptorRecord, JSON.stringify(descriptorRecord))

    this.descriptorRecord = descriptorRecord

    void this.persistDescriptors()
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
    return undefined
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
          void this.addNewApplication()
        } else {
          void this.loadApplicationForDescriptor(descriptors[0])
        }
      }
    } else if (source === DeinitSource.Lock && sideffects) {
      /** Recreate the same application from scratch */
      const descriptor = this.descriptorForApplication(application)
      void this.loadApplicationForDescriptor(descriptor)
    }
  }

  /**
   * Notifies observer when the primary application has changed.
   * Any application which is no longer active is destroyed, and
   * must be removed from the interface.
   */
  public addApplicationChangeObserver(callback: AppGroupChangeCallback): () => void {
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

  public async setPrimaryApplication(application: SNApplication, persist = true): Promise<void> {
    if (this.primaryApplication === application) {
      return
    }

    if (!this.applications.includes(application)) {
      throw Error('Application must be inserted before attempting to switch to it')
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

  private persistDescriptors() {
    void this.deviceInterface.setRawStorageValue(RawStorageKey.DescriptorRecord, JSON.stringify(this.descriptorRecord))
  }

  public async renameDescriptor(descriptor: ApplicationDescriptor, label: string) {
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

  public async addNewApplication(label?: string): Promise<SNApplication> {
    const identifier = UuidGenerator.GenerateUuid()
    const index = this.getDescriptors().length + 1
    const descriptor: ApplicationDescriptor = {
      identifier: identifier,
      label: label || `Workspace ${index}`,
      primary: false,
    }
    const application = this.buildApplication(descriptor)
    this.applications.push(application)

    this.descriptorRecord[identifier] = descriptor

    await this.setPrimaryApplication(application)
    this.persistDescriptors()

    return application
  }

  private applicationForDescriptor(descriptor: ApplicationDescriptor) {
    return this.applications.find((app) => app.identifier === descriptor.identifier)
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
    const application = this.callback.applicationCreator(descriptor, this.deviceInterface)
    application.setOnDeinit(this.onApplicationDeinit)
    return application
  }
}
