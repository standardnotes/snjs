import { AppGroupManagedApplication } from './../Application/ApplicationInterface'
import { DeviceInterface } from '@standardnotes/services'
import { ApplicationDescriptor } from './ApplicationDescriptor'

export type AppGroupCallback<D extends DeviceInterface = DeviceInterface> = {
  applicationCreator: (descriptor: ApplicationDescriptor, deviceInterface: D) => Promise<AppGroupManagedApplication>
}
