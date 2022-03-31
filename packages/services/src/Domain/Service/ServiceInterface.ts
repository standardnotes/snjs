import { ApplicationStage } from '../Application/ApplicationStage'
import { EventObserver } from '../Event/EventObserver'

export interface ServiceInterface<E, D> {
  loggingEnabled: boolean
  addEventObserver(observer: EventObserver<E, D>): () => void
  blockDeinit(): Promise<void>
  deinit(): void
  handleApplicationStage(stage: ApplicationStage): Promise<void>
  log(message: string, ...args: unknown[]): void
}
