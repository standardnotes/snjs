import { DeinitSource } from '../Types/DeinitSource'
import { DeinitMode } from '../Application/DeinitMode'
import { AppGroupManagedApplication } from '../Application/ApplicationInterface'

export type DeinitCallback = (application: AppGroupManagedApplication, mode: DeinitMode, source: DeinitSource) => void
