import { AbstractService } from '../Service/AbstractService'

export enum StatusServiceEvent {
  MessageChanged = 'MessageChanged',
}

export interface StatusServiceInterface extends AbstractService<StatusServiceEvent, string> {
  get message(): string
  setMessage(message: string | undefined): void
  addMessage(message: string): () => void
}
