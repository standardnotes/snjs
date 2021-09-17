import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as microtime from 'microtime'
import { Time } from './Time'
import { TimerInterface } from './TimerInterface'

export class Timer implements TimerInterface {
  constructor() {
    dayjs.extend(utc)
  }

  convertMicrosecondsToSeconds(microseconds: number): number {
    return Math.floor(microseconds / Time.MicrosecondsInASecond)
  }

  getTimestampInMicroseconds(): number {
    return microtime.now()
  }

  getUTCDate(): Date {
    return dayjs.utc().toDate()
  }

  getUTCDateNDaysAgo(n: number): Date {
    return dayjs.utc().subtract(n, 'days').toDate()
  }

  convertStringDateToDate(date: string): Date {
    return dayjs.utc(date).toDate()
  }

  convertStringDateToMicroseconds(date: string): number {
    return this.convertStringDateToMilliseconds(date) * Time.MicrosecondsInAMillisecond
  }

  convertStringDateToMilliseconds(date: string): number {
    return dayjs.utc(date).valueOf()
  }

  convertMicrosecondsToMilliseconds(microseconds: number): number {
    return Math.floor(microseconds / Time.MicrosecondsInAMillisecond)
  }

  convertMicrosecondsToStringDate(microseconds: number): string {
    const milliseconds = this.convertMicrosecondsToMilliseconds(microseconds)

    const microsecondsString = microseconds.toString().substring(13)

    return dayjs.utc(milliseconds).format(`YYYY-MM-DDTHH:mm:ss.SSS${microsecondsString}[Z]`)
  }

  convertMicrosecondsToDate(microseconds: number): Date {
    return this.convertStringDateToDate(
      this.convertMicrosecondsToStringDate(microseconds)
    )
  }
}
