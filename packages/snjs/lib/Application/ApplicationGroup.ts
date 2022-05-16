import { UuidString, DeinitSource } from '../Types'
import { SNApplication } from './Application'
import {
  AbstractService,
  DeviceInterface,
  InternalEventBus,
  InternalEventBusInterface,
  RawStorageKey,
} from '@standardnotes/services'
import { UuidGenerator } from '@standardnotes/utils'

export type ApplicationDescriptor = {
  identifier: string | UuidString
  label: string
  /** Whether the application is the primary user-facing selected application */
  primary: boolean
}

export type DescriptorRecord = Record<string, ApplicationDescriptor>

type AppGroupCallback<D extends DeviceInterface = DeviceInterface> = {
  applicationCreator: (descriptor: ApplicationDescriptor, deviceInterface: D) => SNApplication
}

export enum ApplicationGroupEvent {
  PrimaryApplicationChanged = 'PrimaryApplicationChanged',
  PrimaryDescriptorChanged = 'PrimaryDescriptorChanged',
}

export type ApplicationGroupEventData = {
  primaryApplication?: SNApplication
  primaryDescriptor?: ApplicationDescriptor
}

export enum ApplicationGroupMode {
  AutoSwitch = 'AutoSwitch',
  RequiresReload = 'RequiresReload',
}

export class SNApplicationGroup<D extends DeviceInterface = DeviceInterface> extends AbstractService<
  ApplicationGroupEvent,
  ApplicationGroupEventData
> {
  public primaryApplication?: SNApplication
  private descriptorRecord!: DescriptorRecord
  callback!: AppGroupCallback<D>

  constructor(
    public deviceInterface: D,
    private mode: ApplicationGroupMode = ApplicationGroupMode.AutoSwitch,
    internalEventBus?: InternalEventBusInterface,
  ) {
    if (internalEventBus === undefined) {
      internalEventBus = new InternalEventBus()
    }

    super(internalEventBus)
  }

  override deinit() {
    super.deinit()

    this.deviceInterface.deinit()
    ;(this.deviceInterface as unknown) = undefined
    ;(this.callback as unknown) = undefined
    ;(this.primaryApplication as unknown) = undefined
    ;(this.onApplicationDeinit as unknown) = undefined
  }

  public async initialize(callback: AppGroupCallback<D>): Promise<void> {
    this.callback = callback

    this.descriptorRecord = (await this.deviceInterface.getJsonParsedRawStorageValue(
      RawStorageKey.DescriptorRecord,
    )) as DescriptorRecord

    if (!this.descriptorRecord) {
      this.createDescriptorRecord()
    }

    const primaryDescriptor = this.findPrimaryDescriptor()
    if (!primaryDescriptor) {
      throw Error('No primary application descriptor found. Ensure migrations have been run.')
    }

    const application = this.buildApplication(primaryDescriptor)

    void this.setPrimaryApplication(application, { persist: false })
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

    void this.addNewApplication()
  }

  onApplicationDeinit = (application: SNApplication, source: DeinitSource) => {
    /** If we are initiaitng this unloading via function below, we don't want any side-effects */
    const sideffects = source !== DeinitSource.AppGroupUnload

    if (this.primaryApplication === application) {
      this.primaryApplication = undefined
    }

    if (source === DeinitSource.SignOut) {
      void this.removeDescriptor(this.descriptorForApplication(application))

      if (sideffects) {
        /** If there are no more descriptors (all accounts have been signed out), create a new blank slate app */
        const descriptors = this.getDescriptors()

        if (descriptors.length === 0) {
          this.handleAllWorkspacesSignedOut()

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

  handleAllWorkspacesSignedOut(): void {
    /** Optional override */
  }

  public async setPrimaryApplication(
    application: SNApplication,
    { persist = true }: { persist: boolean },
  ): Promise<void> {
    if (this.primaryApplication === application) {
      return
    }

    const previousApplication = this.primaryApplication

    this.primaryApplication = application

    const descriptor = this.descriptorForApplication(application)

    this.setDescriptorAsPrimary(descriptor)

    if (persist) {
      await this.persistDescriptors()
    }

    if (previousApplication) {
      previousApplication.deinit(DeinitSource.AppGroupUnload)
    }

    await this.notifyEvent(ApplicationGroupEvent.PrimaryApplicationChanged, { primaryApplication: application })
  }

  public setDescriptorAsPrimary(primaryDescriptor: ApplicationDescriptor) {
    for (const descriptor of this.getDescriptors()) {
      descriptor.primary = descriptor === primaryDescriptor
    }
  }

  private persistDescriptors() {
    return this.deviceInterface.setRawStorageValue(
      RawStorageKey.DescriptorRecord,
      JSON.stringify(this.descriptorRecord),
    )
  }

  public renameDescriptor(descriptor: ApplicationDescriptor, label: string) {
    descriptor.label = label

    void this.persistDescriptors()
  }

  public removeDescriptor(descriptor: ApplicationDescriptor) {
    delete this.descriptorRecord[descriptor.identifier]

    return this.persistDescriptors()
  }

  public removeAllDescriptors() {
    this.descriptorRecord = {}

    return this.persistDescriptors()
  }

  private descriptorForApplication(application: SNApplication) {
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

  public async addNewApplication(label?: string): Promise<void> {
    const identifier = UuidGenerator.GenerateUuid()

    const descriptor = this.createNewApplicationDescriptor(label)
    this.descriptorRecord[identifier] = descriptor

    if (this.mode === ApplicationGroupMode.AutoSwitch) {
      const application = this.buildApplication(descriptor)
      void this.setPrimaryApplication(application, { persist: true })
    } else {
      this.setDescriptorAsPrimary(descriptor)
      await this.persistDescriptors()
      this.primaryApplication?.deinit(DeinitSource.AppGroupUnload)
      await this.notifyEvent(ApplicationGroupEvent.PrimaryDescriptorChanged, { primaryDescriptor: descriptor })
    }
  }

  public loadApplicationForDescriptor(descriptor: ApplicationDescriptor) {
    const application = this.buildApplication(descriptor)

    return this.setPrimaryApplication(application, { persist: true })
  }

  private buildApplication(descriptor: ApplicationDescriptor) {
    const application = this.callback.applicationCreator(descriptor, this.deviceInterface)
    application.setOnDeinit(this.onApplicationDeinit)
    return application
  }
}
