import { ApplicationStage } from '@standardnotes/common'
import { DeviceInterface } from '../Device/DeviceInterface'
import { EventObserver } from '../Event/EventObserver'

export interface ServiceInterface<T, V> {
  loggingEnabled: boolean
  deviceInterface?: DeviceInterface
  addEventObserver(observer: EventObserver<T, V>): () => void
  blockDeinit(): Promise<void>
  deinit(): void
  handleApplicationStage(stage: ApplicationStage): Promise<void>
  log(message: string, ...args: unknown[]): void
}
