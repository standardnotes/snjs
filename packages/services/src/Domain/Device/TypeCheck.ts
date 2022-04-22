import { Environment } from './Environments'
import { MobileDeviceInterface } from './MobileDeviceInterface'
import { DeviceInterface } from './DeviceInterface'

export function isMobileDevice(x: DeviceInterface): x is MobileDeviceInterface {
  return x.environment === Environment.Mobile
}
