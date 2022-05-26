import * as IORedis from 'ioredis'
import { AnalyticsActivity } from '../../Domain'

import { RedisAnalyticsStore } from './RedisAnalyticsStore'

describe('RedisAnalyticsStore', () => {
  let redisClient: IORedis.Redis

  const createStore = () => new RedisAnalyticsStore(redisClient)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.incr = jest.fn()
    redisClient.setbit = jest.fn()
    redisClient.getbit = jest.fn().mockReturnValue(1)
  })

  it('shoud tell if activity was done yesterday', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(1653395155000)
    await createStore().wasActivityDoneYesterday(AnalyticsActivity.EditingItems, 123)
    jest.useRealTimers()

    expect(redisClient.getbit).toHaveBeenCalledWith('bitmap:action:editing-items:timespan:2022-5-23', 123)
  })

  it('shoud tell if activity was done today', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(1653395155000)
    await createStore().wasActivityDoneToday(AnalyticsActivity.EditingItems, 123)
    jest.useRealTimers()

    expect(redisClient.getbit).toHaveBeenCalledWith('bitmap:action:editing-items:timespan:2022-5-24', 123)
  })

  it('shoud tell if activity was done last week', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(1653395155000)
    await createStore().wasActivityDoneLastWeek(AnalyticsActivity.EditingItems, 123)
    jest.useRealTimers()

    expect(redisClient.getbit).toHaveBeenCalledWith('bitmap:action:editing-items:timespan:2022-week-20', 123)
  })

  it('shoud tell if activity was done this week', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(1653395155000)
    await createStore().wasActivityDoneThisWeek(AnalyticsActivity.EditingItems, 123)
    jest.useRealTimers()

    expect(redisClient.getbit).toHaveBeenCalledWith('bitmap:action:editing-items:timespan:2022-week-21', 123)
  })

  it('should set analytics activity', async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(1653395155000)
    await createStore().markActivity(AnalyticsActivity.EditingItems, 123)
    jest.useRealTimers()

    expect(redisClient.setbit).toBeCalledTimes(3)
    expect(redisClient.setbit).toHaveBeenNthCalledWith(1, 'bitmap:action:editing-items:timespan:2022-5', 123, 1)
    expect(redisClient.setbit).toHaveBeenNthCalledWith(2, 'bitmap:action:editing-items:timespan:2022-week-21', 123, 1)
    expect(redisClient.setbit).toHaveBeenNthCalledWith(3, 'bitmap:action:editing-items:timespan:2022-5-24', 123, 1)
  })

  it('should get yesterday out of sync incidents', async () => {
    redisClient.get = jest.fn().mockReturnValue(1)

    expect(await createStore().getYesterdayOutOfSyncIncidents()).toEqual(1)
  })

  it('should default to 0 yesterday out of sync incidents', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createStore().getYesterdayOutOfSyncIncidents()).toEqual(0)
  })

  it('should get yesterday application version usage', async () => {
    redisClient.keys = jest
      .fn()
      .mockReturnValue([
        'count:action:application-request:1.2.3:timespan:2022-3-10',
        'count:action:application-request:2.3.4:timespan:2022-3-10',
      ])
    redisClient.get = jest.fn().mockReturnValueOnce(3).mockReturnValueOnce(4)

    expect(await createStore().getYesterdayApplicationUsage()).toEqual([
      { count: 3, version: '1.2.3' },
      { count: 4, version: '2.3.4' },
    ])
  })

  it('should get yesterday snjs version usage', async () => {
    redisClient.keys = jest
      .fn()
      .mockReturnValue([
        'count:action:snjs-request:1.2.3:timespan:2022-3-10',
        'count:action:snjs-request:2.3.4:timespan:2022-3-10',
      ])
    redisClient.get = jest.fn().mockReturnValueOnce(3).mockReturnValueOnce(4)

    expect(await createStore().getYesterdaySNJSUsage()).toEqual([
      { count: 3, version: '1.2.3' },
      { count: 4, version: '2.3.4' },
    ])
  })

  it('should increment application version usage', async () => {
    await createStore().incrementApplicationVersionUsage('1.2.3')

    expect(redisClient.incr).toHaveBeenCalled()
  })

  it('should increment snjs version usage', async () => {
    await createStore().incrementSNJSVersionUsage('1.2.3')

    expect(redisClient.incr).toHaveBeenCalled()
  })

  it('should increment out of sync incedent count', async () => {
    await createStore().incrementOutOfSyncIncidents()

    expect(redisClient.incr).toHaveBeenCalled()
  })
})
