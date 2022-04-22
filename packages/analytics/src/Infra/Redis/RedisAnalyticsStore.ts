import * as IORedis from 'ioredis'

import { AnalyticsStoreInterface } from '../../Domain/Service/AnalyticsStoreInterface'

export class RedisAnalyticsStore implements AnalyticsStoreInterface {
  constructor(private redisClient: IORedis.Redis) {}

  async getYesterdayOutOfSyncIncidents(): Promise<number> {
    const count = await this.redisClient.get(
      `count:action:out-of-sync:timespan:${this.getDailyKey(this.getYesterdayDate())}`,
    )

    if (count === null) {
      return 0
    }

    return +count
  }

  async incrementOutOfSyncIncidents(): Promise<void> {
    await this.redisClient.incr(`count:action:out-of-sync:timespan:${this.getDailyKey()}`)
    await this.redisClient.incr(`count:action:out-of-sync:timespan:${this.getMonthlyKey()}`)
  }

  async getYesterdaySNJSUsage(): Promise<{ version: string; count: number }[]> {
    const keys = await this.redisClient.keys(
      `count:action:snjs-request:*:timespan:${this.getDailyKey(this.getYesterdayDate())}`,
    )

    return this.getRequestCountPerVersion(keys)
  }

  async getYesterdayApplicationUsage(): Promise<{ version: string; count: number }[]> {
    const keys = await this.redisClient.keys(
      `count:action:application-request:*:timespan:${this.getDailyKey(this.getYesterdayDate())}`,
    )

    return this.getRequestCountPerVersion(keys)
  }

  async incrementApplicationVersionUsage(applicationVersion: string): Promise<void> {
    await this.redisClient.incr(`count:action:application-request:${applicationVersion}:timespan:${this.getDailyKey()}`)
    await this.redisClient.incr(
      `count:action:application-request:${applicationVersion}:timespan:${this.getMonthlyKey()}`,
    )
  }

  async incrementSNJSVersionUsage(snjsVersion: string): Promise<void> {
    await this.redisClient.incr(`count:action:snjs-request:${snjsVersion}:timespan:${this.getDailyKey()}`)
    await this.redisClient.incr(`count:action:snjs-request:${snjsVersion}:timespan:${this.getMonthlyKey()}`)
  }

  private async getRequestCountPerVersion(keys: string[]): Promise<{ version: string; count: number }[]> {
    const statistics = []
    for (const key of keys) {
      const count = await this.redisClient.get(key)
      const version = key.split(':')[3]
      statistics.push({
        version,
        count: +(count as string),
      })
    }

    return statistics
  }

  private getMonthlyKey() {
    const date = new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}`
  }

  private getDailyKey(date?: Date) {
    date = date ?? new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}-${this.getDayOfTheMonth(date)}`
  }

  private getYear(date: Date): string {
    return date.getFullYear().toString()
  }

  private getMonth(date: Date): string {
    return (date.getMonth() + 1).toString()
  }

  private getDayOfTheMonth(date: Date): string {
    return date.getDate().toString()
  }

  private getYesterdayDate(): Date {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 1)

    return yesterday
  }
}
