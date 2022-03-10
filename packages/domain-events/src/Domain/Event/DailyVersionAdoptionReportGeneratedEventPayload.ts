export interface DailyVersionAdoptionReportGeneratedEventPayload {
  snjsStatistics: Array<{
    version: string,
    count: number
  }>
  applicationStatistics: Array<{
    version: string,
    count: number
  }>
  outOfSyncIncidents: number
}
