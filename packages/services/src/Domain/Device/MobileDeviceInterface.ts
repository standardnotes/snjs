import { DeviceInterface } from './DeviceInterface'
import { Environment } from './Environments'
import { LegacyMobileKeychainStructure } from '@standardnotes/models'

export interface MobileDeviceInterface extends DeviceInterface {
  environment: Environment.Mobile

  getRawKeychainValue(): Promise<LegacyMobileKeychainStructure>
}
