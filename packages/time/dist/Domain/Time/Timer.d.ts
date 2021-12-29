import { TimerInterface } from './TimerInterface';
export declare class Timer implements TimerInterface {
    constructor();
    convertDateToMilliseconds(date: Date): number;
    convertDateToMicroseconds(date: Date): number;
    convertMicrosecondsToSeconds(microseconds: number): number;
    getTimestampInMicroseconds(): number;
    getUTCDate(): Date;
    getUTCDateNDaysAgo(n: number): Date;
    getUTCDateNDaysAhead(n: number): Date;
    getUTCDateNHoursAgo(n: number): Date;
    getUTCDateNHoursAhead(n: number): Date;
    convertStringDateToDate(date: string): Date;
    convertStringDateToMicroseconds(date: string): number;
    convertStringDateToMilliseconds(date: string): number;
    convertMicrosecondsToMilliseconds(microseconds: number): number;
    convertMicrosecondsToStringDate(microseconds: number): string;
    convertMicrosecondsToDate(microseconds: number): Date;
}
