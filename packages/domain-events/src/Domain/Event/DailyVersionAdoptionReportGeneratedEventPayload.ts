export interface DailyVersionAdoptionReportGeneratedEventPayload {
  snjsStatistics: Array<{
    version: string
    count: number
  }>
  applicationStatistics: Array<{
    version: string
    count: number
  }>
  activityStatistics: Array<{
    name: string
    retention: number
  }>
  outOfSyncIncidents: number
}
