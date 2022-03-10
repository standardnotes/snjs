import * as IORedis from 'ioredis'

import { RedisAnalyticsStore } from './RedisAnalyticsStore'

describe('RedisAnalyticsStore', () => {
  let redisClient: IORedis.Redis

  const createStore = () => new RedisAnalyticsStore(redisClient)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.incr = jest.fn()
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
    redisClient.keys = jest.fn().mockReturnValue(['count:action:application-request:1.2.3:timespan:2022-3-10', 'count:action:application-request:2.3.4:timespan:2022-3-10'])
    redisClient.get = jest.fn()
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(4)

    expect(await createStore().getYesterdayApplicationUsage()).toEqual([{ 'count': 3, 'version': '1.2.3' }, { 'count': 4, 'version': '2.3.4' }])
  })

  it('should get yesterday snjs version usage', async () => {
    redisClient.keys = jest.fn().mockReturnValue(['count:action:snjs-request:1.2.3:timespan:2022-3-10', 'count:action:snjs-request:2.3.4:timespan:2022-3-10'])
    redisClient.get = jest.fn()
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(4)

    expect(await createStore().getYesterdaySNJSUsage()).toEqual([{ 'count': 3, 'version': '1.2.3' }, { 'count': 4, 'version': '2.3.4' }])
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
