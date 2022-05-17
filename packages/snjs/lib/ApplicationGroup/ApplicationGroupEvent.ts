import { DeinitSource } from '../Types'
import { ApplicationInterface } from '../Application/ApplicationInterface'
import { DeinitMode } from '../Application/DeinitMode'
import { DescriptorRecord } from './DescriptorRecord'

export enum ApplicationGroupEvent {
  PrimaryApplicationSet = 'PrimaryApplicationSet',
  DescriptorsDataChanged = 'DescriptorsDataChanged',
  DeviceWillRestart = 'DeviceWillRestart',
}

export interface ApplicationGroupEventData {
  [ApplicationGroupEvent.PrimaryApplicationSet]: {
    application: ApplicationInterface
  }
  [ApplicationGroupEvent.DeviceWillRestart]: {
    source: DeinitSource
    mode: DeinitMode
  }
  [ApplicationGroupEvent.DescriptorsDataChanged]: {
    descriptors: DescriptorRecord
  }
}
