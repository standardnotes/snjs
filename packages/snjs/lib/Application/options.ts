import { Runtime, ApplicationIdentifier } from '@standardnotes/common'
import { SNAlertService } from '../Services/Alert/AlertService'
import { DeviceInterface } from '@standardnotes/services'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { Environment, Platform } from './platforms'

export interface ApplicationSyncOptions {
  /**
   * The size of the item batch to decrypt and render upon application load.
   */
  loadBatchSize: number
}

export interface ConstructorOptions {
  /**
   * The Environment that identifies your application.
   */
  environment: Environment
  /**
   * The Platform that identifies your application.
   */
  platform: Platform
  /**
   * The device interface that provides platform specific
   * utilities that are used to read/write raw values from/to the database or value storage.
   */
  deviceInterface: DeviceInterface
  /**
   * The platform-dependent implementation of SNPureCrypto to use.
   * Web uses SNWebCrypto, mobile uses SNReactNativeCrypto.
   */
  crypto: SNPureCrypto
  /**
   * The platform-dependent implementation of alert service.
   */
  alertService: SNAlertService
  /**
   * A unique persistent identifier to namespace storage and other
   * persistent properties. For an ephemeral runtime identifier, use ephemeralIdentifier.
   */
  identifier: ApplicationIdentifier
  /**
   * Gives consumers the ability to provide their own custom
   * subclass for a service. swapClasses should be an array of key/value pairs
   * consisting of keys 'swap' and 'with'. 'swap' is the base class you wish to replace,
   * and 'with' is the custom subclass to use.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  swapClasses?: { swap: any; with: any }[]
  /**
   * Default host to use in ApiService.
   */
  defaultHost: string
  /**
   * Version of client application.
   */
  appVersion: string
  /**
   * URL for WebSocket providing permissions and roles information.
   */
  webSocketUrl?: string
  runtime?: Runtime
}

export type ApplicationOptions = ConstructorOptions & Partial<ApplicationSyncOptions>

interface OptionsWithDefaults {
  runtime: Runtime
  loadBatchSize: number
}

export const ApplicationOptionsDefaults: Partial<ApplicationOptions> = {
  loadBatchSize: 700,
  runtime: Runtime.Prod,
}

/** ApplicationOptions with defaults populated */
export type FullyResolvedApplicationOptions = ConstructorOptions & OptionsWithDefaults
