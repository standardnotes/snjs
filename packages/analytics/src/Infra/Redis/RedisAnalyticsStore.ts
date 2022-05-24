import * as IORedis from 'ioredis'
import { AnalyticsActivity } from '../../Domain'

import { AnalyticsStoreInterface } from '../../Domain/Service/AnalyticsStoreInterface'

export class RedisAnalyticsStore implements AnalyticsStoreInterface {
  constructor(private redisClient: IORedis.Redis) {}

  async markActivity(activity: AnalyticsActivity, analyticsId: number): Promise<void> {
    await this.redisClient.setbit(`bitmap:action:${activity}:timespan:${this.getMonthlyKey()}`, analyticsId, 1)
    await this.redisClient.setbit(`bitmap:action:${activity}:timespan:${this.getWeeklyKey()}`, analyticsId, 1)
    await this.redisClient.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey()}`, analyticsId, 1)
  }

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

  private getMonthlyKey(): string {
    const date = new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}`
  }

  private getDailyKey(date?: Date): string {
    date = date ?? new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}-${this.getDayOfTheMonth(date)}`
  }

  private getWeeklyKey(): string {
    const date = new Date()

    const firstJanuary = new Date(date.getFullYear(), 0, 1)

    const numberOfDaysPassed = Math.floor((date.getTime() - firstJanuary.getTime()) / (24 * 60 * 60 * 1000))

    const weekNumber = Math.ceil((date.getDay() + 1 + numberOfDaysPassed) / 7)

    return `${this.getYear(date)}-week-${weekNumber}`
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
