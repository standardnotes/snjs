import { DeviceInterface } from './DeviceInterface'
import { RawKeychainValue } from './KeychainTypes'

export interface WebOrDesktopDeviceInterface extends DeviceInterface {
  readonly appVersion: string

  getKeychainValue(): Promise<RawKeychainValue>

  setKeychainValue(value: RawKeychainValue): Promise<void>
}
