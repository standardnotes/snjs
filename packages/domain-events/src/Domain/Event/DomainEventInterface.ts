export interface DomainEventInterface {
  type: string
  createdAt: Date
  payload: unknown
  meta: {
    correlation: {
      userIdentifier: string
      userIdentifierType: 'uuid' | 'email'
    }
  }
}
