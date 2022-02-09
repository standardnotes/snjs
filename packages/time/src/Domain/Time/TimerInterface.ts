export interface TimerInterface {
  getTimestampInMicroseconds(): number
  getUTCDate(): Date
  getUTCDateNDaysAgo(n: number): Date
  getUTCDateNDaysAhead(n: number): Date
  getUTCDateNHoursAgo(n: number): Date
  getUTCDateNHoursAhead(n: number): Date
  convertDateToMilliseconds(date: Date): number
  convertDateToMicroseconds(date: Date): number
  convertDateToISOString(date: Date): string
  convertStringDateToDate(date: string): Date
  convertStringDateToMicroseconds(date: string): number
  convertStringDateToMilliseconds(date: string): number
  convertMicrosecondsToMilliseconds(microseconds: number): number
  convertMicrosecondsToSeconds(microseconds: number): number
  convertMicrosecondsToStringDate(microseconds: number): string
  convertMicrosecondsToDate(microseconds: number): Date
  dateWasNDaysAgo(date: Date): number
}
