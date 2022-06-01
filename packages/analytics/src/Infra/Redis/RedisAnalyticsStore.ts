import * as IORedis from 'ioredis'
import { AnalyticsActivity } from '../../Domain'

import { AnalyticsStoreInterface } from '../../Domain/Service/AnalyticsStoreInterface'

export class RedisAnalyticsStore implements AnalyticsStoreInterface {
  constructor(private redisClient: IORedis.Redis) {}

  async unmarkActivityForToday(activity: AnalyticsActivity, analyticsId: number): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getMonthlyKey()}`, analyticsId, 0)
    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getWeeklyKey()}`, analyticsId, 0)
    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey()}`, analyticsId, 0)

    await pipeline.exec()
  }

  async unmarkActivitiesForToday(activities: AnalyticsActivity[], analyticsId: number): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getMonthlyKey()}`, analyticsId, 0)
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getWeeklyKey()}`, analyticsId, 0)
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey()}`, analyticsId, 0)
    }

    await pipeline.exec()
  }

  async unmarkActivityForYesterday(activity: AnalyticsActivity, analyticsId: number): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getMonthlyKey(this.getYesterdayDate())}`, analyticsId, 0)
    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getWeeklyKey(this.getYesterdayDate())}`, analyticsId, 0)
    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey(this.getYesterdayDate())}`, analyticsId, 0)

    await pipeline.exec()
  }

  async unmarkActivitiesForYesterday(activities: AnalyticsActivity[], analyticsId: number): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      pipeline.setbit(
        `bitmap:action:${activity}:timespan:${this.getMonthlyKey(this.getYesterdayDate())}`,
        analyticsId,
        0,
      )
      pipeline.setbit(
        `bitmap:action:${activity}:timespan:${this.getWeeklyKey(this.getYesterdayDate())}`,
        analyticsId,
        0,
      )
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey(this.getYesterdayDate())}`, analyticsId, 0)
    }

    await pipeline.exec()
  }

  async markActivityForToday(activity: AnalyticsActivity, analyticsId: number): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getMonthlyKey()}`, analyticsId, 1)
    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getWeeklyKey()}`, analyticsId, 1)
    pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey()}`, analyticsId, 1)

    await pipeline.exec()
  }

  async markActivitiesForToday(activities: AnalyticsActivity[], analyticsId: number): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getMonthlyKey()}`, analyticsId, 1)
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getWeeklyKey()}`, analyticsId, 1)
      pipeline.setbit(`bitmap:action:${activity}:timespan:${this.getDailyKey()}`, analyticsId, 1)
    }

    await pipeline.exec()
  }

  async calculateActivityTotalCountForYesterday(activity: AnalyticsActivity): Promise<number> {
    return this.redisClient.bitcount(`bitmap:action:${activity}:timespan:${this.getDailyKey(this.getYesterdayDate())}`)
  }

  async calculateActivityTotalCountForLastWeek(activity: AnalyticsActivity): Promise<number> {
    return this.redisClient.bitcount(`bitmap:action:${activity}:timespan:${this.getWeeklyKey(this.getLastWeekDate())}`)
  }

  async calculateActivityRetentionForYesterday(activity: AnalyticsActivity): Promise<number> {
    const dayBeforeYesterdayKey = this.getDailyKey(this.getDayBeforeYesterdayDate())
    const yesterdayKey = this.getDailyKey(this.getYesterdayDate())

    const diffKey = `bitmap:action:${activity}:timespan:${dayBeforeYesterdayKey}-${yesterdayKey}`

    await this.redisClient.send_command(
      'BITOP',
      'AND',
      diffKey,
      `bitmap:action:${activity}:timespan:${dayBeforeYesterdayKey}`,
      `bitmap:action:${activity}:timespan:${yesterdayKey}`,
    )

    const yesterdayAndDayBeforeYesterdayTotalInActivity = await this.redisClient.bitcount(diffKey)

    const dayBeforeYesterdayTotalInActivity = await this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${dayBeforeYesterdayKey}`,
    )

    return Math.ceil((yesterdayAndDayBeforeYesterdayTotalInActivity * 100) / dayBeforeYesterdayTotalInActivity)
  }

  async calculateActivityRetentionForLastWeek(activity: AnalyticsActivity): Promise<number> {
    const weekBeforeLastWeekKey = this.getWeeklyKey(this.getWeekBeforeLastWeekDate())
    const lastWeekKey = this.getWeeklyKey(this.getLastWeekDate())

    const diffKey = `bitmap:action:${activity}:timespan:${weekBeforeLastWeekKey}-${lastWeekKey}`

    await this.redisClient.send_command(
      'BITOP',
      'AND',
      diffKey,
      `bitmap:action:${activity}:timespan:${weekBeforeLastWeekKey}`,
      `bitmap:action:${activity}:timespan:${lastWeekKey}`,
    )

    const lastWeekAndWeekBeforeLastWeekTotalInActivity = await this.redisClient.bitcount(diffKey)

    const weekBeforeLastWeekTotalInActivity = await this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${weekBeforeLastWeekKey}`,
    )

    return Math.ceil((lastWeekAndWeekBeforeLastWeekTotalInActivity * 100) / weekBeforeLastWeekTotalInActivity)
  }

  async wasActivityDoneYesterday(activity: AnalyticsActivity, analyticsId: number): Promise<boolean> {
    const bitValue = await this.redisClient.getbit(
      `bitmap:action:${activity}:timespan:${this.getDailyKey(this.getYesterdayDate())}`,
      analyticsId,
    )

    return bitValue === 1
  }

  async wasActivityDoneToday(activity: AnalyticsActivity, analyticsId: number): Promise<boolean> {
    const bitValue = await this.redisClient.getbit(
      `bitmap:action:${activity}:timespan:${this.getDailyKey()}`,
      analyticsId,
    )

    return bitValue === 1
  }

  async wasActivityDoneLastWeek(activity: AnalyticsActivity, analyticsId: number): Promise<boolean> {
    const bitValue = await this.redisClient.getbit(
      `bitmap:action:${activity}:timespan:${this.getWeeklyKey(this.getLastWeekDate())}`,
      analyticsId,
    )

    return bitValue === 1
  }

  async wasActivityDoneThisWeek(activity: AnalyticsActivity, analyticsId: number): Promise<boolean> {
    const bitValue = await this.redisClient.getbit(
      `bitmap:action:${activity}:timespan:${this.getWeeklyKey()}`,
      analyticsId,
    )

    return bitValue === 1
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
    const pipeline = this.redisClient.pipeline()

    pipeline.incr(`count:action:out-of-sync:timespan:${this.getDailyKey()}`)
    pipeline.incr(`count:action:out-of-sync:timespan:${this.getMonthlyKey()}`)

    await pipeline.exec()
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
    const pipeline = this.redisClient.pipeline()

    pipeline.incr(`count:action:application-request:${applicationVersion}:timespan:${this.getDailyKey()}`)
    pipeline.incr(`count:action:application-request:${applicationVersion}:timespan:${this.getMonthlyKey()}`)

    await pipeline.exec()
  }

  async incrementSNJSVersionUsage(snjsVersion: string): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    pipeline.incr(`count:action:snjs-request:${snjsVersion}:timespan:${this.getDailyKey()}`)
    pipeline.incr(`count:action:snjs-request:${snjsVersion}:timespan:${this.getMonthlyKey()}`)

    await pipeline.exec()
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

  private getMonthlyKey(date?: Date): string {
    date = date ?? new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}`
  }

  private getDailyKey(date?: Date): string {
    date = date ?? new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}-${this.getDayOfTheMonth(date)}`
  }

  private getWeeklyKey(date?: Date): string {
    date = date ?? new Date()

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

  private getDayBeforeYesterdayDate(): Date {
    const dayBeforeYesterday = new Date()
    dayBeforeYesterday.setDate(new Date().getDate() - 2)

    return dayBeforeYesterday
  }

  private getLastWeekDate(): Date {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 7)

    return yesterday
  }

  private getWeekBeforeLastWeekDate(): Date {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 14)

    return yesterday
  }
}
