import { AnalyticsActivity } from './AnalyticsActivity'

export interface AnalyticsStoreInterface {
  incrementSNJSVersionUsage(snjsVersion: string): Promise<void>
  incrementApplicationVersionUsage(applicationVersion: string): Promise<void>
  incrementOutOfSyncIncidents(): Promise<void>
  getYesterdaySNJSUsage(): Promise<Array<{ version: string; count: number }>>
  getYesterdayApplicationUsage(): Promise<Array<{ version: string; count: number }>>
  getYesterdayOutOfSyncIncidents(): Promise<number>
  unmarkActivityForToday(activity: AnalyticsActivity, analyticsId: number): Promise<void>
  unmarkActivitiesForToday(activities: AnalyticsActivity[], analyticsId: number): Promise<void>
  unmarkActivityForYesterday(activity: AnalyticsActivity, analyticsId: number): Promise<void>
  unmarkActivitiesForYesterday(activities: AnalyticsActivity[], analyticsId: number): Promise<void>
  markActivityForToday(activity: AnalyticsActivity, analyticsId: number): Promise<void>
  markActivitiesForToday(activities: AnalyticsActivity[], analyticsId: number): Promise<void>
  wasActivityDoneYesterday(activity: AnalyticsActivity, analyticsId: number): Promise<boolean>
  wasActivityDoneToday(activity: AnalyticsActivity, analyticsId: number): Promise<boolean>
  wasActivityDoneLastWeek(activity: AnalyticsActivity, analyticsId: number): Promise<boolean>
  wasActivityDoneThisWeek(activity: AnalyticsActivity, analyticsId: number): Promise<boolean>
  calculateActivityRetentionForYesterday(activity: AnalyticsActivity): Promise<number>
  calculateActivityRetentionForLastWeek(activity: AnalyticsActivity): Promise<number>
  calculateActivityTotalCountForYesterday(activity: AnalyticsActivity): Promise<number>
  calculateActivityTotalCountForLastWeek(activity: AnalyticsActivity): Promise<number>
}
