import { ApplicationIdentifier } from '@standardnotes/common'
import { UserClientInterface } from './../Services/User/UserClientInterface'
import { DeinitSource } from './../Types/DeinitSource'

export enum DeinitMode {
  Soft = 'Soft',
  Hard = 'Hard',
}

export type DeinitCallback = (application: ApplicationInterface, mode: DeinitMode, source: DeinitSource) => void

export interface ApplicationInterface {
  onDeinit?: DeinitCallback

  deinit(mode: DeinitMode, source: DeinitSource): void

  getDeinitMode(): DeinitMode

  setOnDeinit(onDeinit: DeinitCallback): void

  get user(): UserClientInterface

  readonly identifier: ApplicationIdentifier
}
