import { UuidString, DeinitSource } from '../Types'
import {
  AbstractService,
  DeviceInterface,
  InternalEventBus,
  InternalEventBusInterface,
  RawStorageKey,
} from '@standardnotes/services'
import { UuidGenerator } from '@standardnotes/utils'
import { ApplicationInterface, DeinitCallback, DeinitMode } from './ApplicationInterface'

export type ApplicationDescriptor = {
  identifier: string | UuidString
  label: string
  /** Whether the application is the primary user-facing selected application */
  primary: boolean
}

export type DescriptorRecord = Record<string, ApplicationDescriptor>

type AppGroupCallback<D extends DeviceInterface = DeviceInterface> = {
  applicationCreator: (descriptor: ApplicationDescriptor, deviceInterface: D) => ApplicationInterface
}

export enum ApplicationGroupEvent {
  PrimaryApplicationSet = 'PrimaryApplicationSet',
  DescriptorsDataChanged = 'DescriptorsDataChanged',
  DeviceWillRestart = 'DeviceWillRestart',
}

export type ApplicationGroupEventData = {
  primaryApplication?: ApplicationInterface
  primaryDescriptor?: ApplicationDescriptor
}

export class SNApplicationGroup<D extends DeviceInterface = DeviceInterface> extends AbstractService<
  ApplicationGroupEvent,
  ApplicationGroupEventData
> {
  public primaryApplication?: ApplicationInterface
  private descriptorRecord!: DescriptorRecord
  callback!: AppGroupCallback<D>

  constructor(public device: D, internalEventBus?: InternalEventBusInterface) {
    if (internalEventBus === undefined) {
      internalEventBus = new InternalEventBus()
    }

    super(internalEventBus)
  }

  override deinit() {
    super.deinit()

    this.device.deinit()
    ;(this.device as unknown) = undefined
    ;(this.callback as unknown) = undefined
    ;(this.primaryApplication as unknown) = undefined
    ;(this.onApplicationDeinit as unknown) = undefined
  }

  public async initialize(callback: AppGroupCallback<D>): Promise<void> {
    if (this.device.isDeviceDestroyed()) {
      throw 'Attempting to initialize new application while device is destroyed.'
    }

    this.callback = callback

    this.descriptorRecord = (await this.device.getJsonParsedRawStorageValue(
      RawStorageKey.DescriptorRecord,
    )) as DescriptorRecord

    if (!this.descriptorRecord) {
      this.createNewDescriptorRecord()
    }

    let primaryDescriptor = this.findPrimaryDescriptor()
    if (!primaryDescriptor) {
      console.error('No primary application descriptor found. Ensure migrations have been run.')
      primaryDescriptor = this.getDescriptors()[0]
    }

    const application = this.buildApplication(primaryDescriptor)

    this.primaryApplication = application

    await this.notifyEvent(ApplicationGroupEvent.PrimaryApplicationSet, { primaryApplication: application })
  }

  private createNewDescriptorRecord() {
    /**
     * The identifier 'standardnotes' is used because this was the
     * database name of Standard Notes web/desktop
     * */
    const identifier = 'standardnotes'
    const descriptorRecord: DescriptorRecord = {
      [identifier]: {
        identifier: identifier,
        label: 'Main Workspace',
        primary: true,
      },
    }

    void this.device.setRawStorageValue(RawStorageKey.DescriptorRecord, JSON.stringify(descriptorRecord))

    this.descriptorRecord = descriptorRecord

    void this.persistDescriptors()
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

  async signOutAllWorkspaces() {
    if (this.primaryApplication) {
      await this.primaryApplication.user.signOut(false, DeinitSource.AppGroupUnload)
    }

    await this.removeAllDescriptors()

    this.handleAllWorkspacesSignedOut()

    void this.unloadCurrentAndCreateNewDescriptor()
  }

  onApplicationDeinit: DeinitCallback = (application: ApplicationInterface, mode: DeinitMode, source: DeinitSource) => {
    /** If we are initiaitng this unloading via function below, we don't want any side-effects */
    const isUserInitiated = source !== DeinitSource.AppGroupUnload

    if (this.primaryApplication === application) {
      this.primaryApplication = undefined
    }

    const performSyncronously = async () => {
      if (source === DeinitSource.SignOut) {
        void this.removeDescriptor(this.descriptorForApplication(application))

        if (isUserInitiated) {
          /** If there are no more descriptors (all accounts have been signed out), create a new blank slate app */
          const descriptors = this.getDescriptors()

          if (descriptors.length === 0) {
            this.handleAllWorkspacesSignedOut()

            await this.createNewPrimaryDescriptor()
          }
        }
      }

      const device = this.device

      void this.notifyEvent(ApplicationGroupEvent.DeviceWillRestart)

      this.deinit()

      if (mode === DeinitMode.Hard) {
        device.performHardReset()
      } else {
        device.performSoftReset()
      }
    }

    void performSyncronously()
  }

  handleAllWorkspacesSignedOut(): void {
    /** Optional override */
  }

  public setDescriptorAsPrimary(primaryDescriptor: ApplicationDescriptor) {
    for (const descriptor of this.getDescriptors()) {
      descriptor.primary = descriptor === primaryDescriptor
    }
  }

  private async persistDescriptors() {
    await this.device.setRawStorageValue(RawStorageKey.DescriptorRecord, JSON.stringify(this.descriptorRecord))

    void this.notifyEvent(ApplicationGroupEvent.DescriptorsDataChanged)
  }

  public renameDescriptor(descriptor: ApplicationDescriptor, label: string) {
    descriptor.label = label

    void this.persistDescriptors()
  }

  public removeDescriptor(descriptor: ApplicationDescriptor) {
    delete this.descriptorRecord[descriptor.identifier]

    const descriptors = this.getDescriptors()
    if (descriptor.primary && descriptors.length > 0) {
      this.setDescriptorAsPrimary(descriptors[0])
    }

    return this.persistDescriptors()
  }

  public removeAllDescriptors() {
    this.descriptorRecord = {}

    return this.persistDescriptors()
  }

  private descriptorForApplication(application: ApplicationInterface) {
    return this.descriptorRecord[application.identifier]
  }

  private createNewApplicationDescriptor(label?: string) {
    const identifier = UuidGenerator.GenerateUuid()
    const index = this.getDescriptors().length + 1

    const descriptor: ApplicationDescriptor = {
      identifier: identifier,
      label: label || `Workspace ${index}`,
      primary: false,
    }

    return descriptor
  }

  private async createNewPrimaryDescriptor(label?: string): Promise<void> {
    const descriptor = this.createNewApplicationDescriptor(label)

    this.descriptorRecord[descriptor.identifier] = descriptor

    this.setDescriptorAsPrimary(descriptor)

    await this.persistDescriptors()
  }

  public async unloadCurrentAndCreateNewDescriptor(label?: string): Promise<void> {
    await this.createNewPrimaryDescriptor(label)

    if (this.primaryApplication) {
      this.primaryApplication.deinit(this.primaryApplication.getDeinitMode(), DeinitSource.AppGroupUnload)
    }
  }

  public async unloadCurrentAndActivateDescriptor(descriptor: ApplicationDescriptor) {
    this.setDescriptorAsPrimary(descriptor)

    await this.persistDescriptors()

    if (this.primaryApplication) {
      this.primaryApplication.deinit(this.primaryApplication.getDeinitMode(), DeinitSource.AppGroupUnload)
    }
  }

  private buildApplication(descriptor: ApplicationDescriptor) {
    const application = this.callback.applicationCreator(descriptor, this.device)

    application.setOnDeinit(this.onApplicationDeinit)

    return application
  }
}
