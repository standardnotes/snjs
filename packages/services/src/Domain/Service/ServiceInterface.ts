import { ApplicationStage } from '@standardnotes/applications'
import { DeviceInterface } from '../Device/DeviceInterface'
import { EventObserver } from '../Event/EventObserver'

export interface ServiceInterface<E, D> {
  loggingEnabled: boolean
  deviceInterface?: DeviceInterface
  addEventObserver(observer: EventObserver<E, D>): () => void
  blockDeinit(): Promise<void>
  deinit(): void
  handleApplicationStage(stage: ApplicationStage): Promise<void>
  log(message: string, ...args: unknown[]): void
}
