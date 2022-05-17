import { ApplicationIdentifier } from '@standardnotes/common'
import { UserClientInterface } from './../Services/User/UserClientInterface'
import { DeinitSource } from './../Types/DeinitSource'
import { DeinitCallback } from '../ApplicationGroup/DeinitCallback'
import { DeinitMode } from './DeinitMode'

export interface ApplicationInterface {
  deinit(mode: DeinitMode, source: DeinitSource): void

  getDeinitMode(): DeinitMode

  get user(): UserClientInterface

  readonly identifier: ApplicationIdentifier
}

export interface AppGroupManagedApplication extends ApplicationInterface {
  onDeinit: DeinitCallback

  setOnDeinit(onDeinit: DeinitCallback): void
}
