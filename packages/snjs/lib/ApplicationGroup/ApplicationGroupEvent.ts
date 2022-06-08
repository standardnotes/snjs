import { DeinitMode, DeinitSource } from '@standardnotes/services'
import { ApplicationInterface } from '@standardnotes/services/src/Domain/Application/ApplicationInterface'
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
