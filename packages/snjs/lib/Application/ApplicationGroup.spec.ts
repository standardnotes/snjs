import { SNApplicationGroup } from './ApplicationGroup'
import { DeviceInterface, InternalEventBusInterface } from '@standardnotes/services'

describe.skip('application group', () => {
  const createDevice = () => {
    return {} as jest.Mocked<DeviceInterface>
  }

  let device: DeviceInterface
  let internalEventBus: InternalEventBusInterface

  beforeEach(() => {
    device = createDevice()

    internalEventBus = {} as jest.Mocked<InternalEventBusInterface>
    internalEventBus.publish = jest.fn()

    new SNApplicationGroup(device, internalEventBus)
  })
})
