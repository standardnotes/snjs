import * as IORedis from 'ioredis'

import { DomainEventSubscriberInterface } from '../../Domain/Subscriber/DomainEventSubscriberInterface'

export class RedisDomainEventSubscriber implements DomainEventSubscriberInterface {
  constructor (
    private redisClient: IORedis.Redis,
    private eventChannel: string
  ) {
  }

  start(): void {
    void this.redisClient.subscribe(this.eventChannel)
  }
}
