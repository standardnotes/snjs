"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const microtime = require("microtime");
const Time_1 = require("./Time");
class Timer {
    constructor() {
        dayjs.extend(utc);
    }
    convertDateToMilliseconds(date) {
        return this.convertStringDateToMilliseconds(date.toString());
    }
    convertDateToMicroseconds(date) {
        return this.convertStringDateToMicroseconds(date.toString());
    }
    convertMicrosecondsToSeconds(microseconds) {
        return Math.floor(microseconds / Time_1.Time.MicrosecondsInASecond);
    }
    getTimestampInMicroseconds() {
        return microtime.now();
    }
    getUTCDate() {
        return dayjs.utc().toDate();
    }
    getUTCDateNDaysAgo(n) {
        return dayjs.utc().subtract(n, 'days').toDate();
    }
    getUTCDateNDaysAhead(n) {
        return dayjs.utc().add(n, 'days').toDate();
    }
    getUTCDateNHoursAgo(n) {
        return dayjs.utc().subtract(n, 'hours').toDate();
    }
    getUTCDateNHoursAhead(n) {
        return dayjs.utc().add(n, 'hours').toDate();
    }
    convertStringDateToDate(date) {
        return dayjs.utc(date).toDate();
    }
    convertStringDateToMicroseconds(date) {
        return this.convertStringDateToMilliseconds(date) * Time_1.Time.MicrosecondsInAMillisecond;
    }
    convertStringDateToMilliseconds(date) {
        return dayjs.utc(date).valueOf();
    }
    convertMicrosecondsToMilliseconds(microseconds) {
        return Math.floor(microseconds / Time_1.Time.MicrosecondsInAMillisecond);
    }
    convertMicrosecondsToStringDate(microseconds) {
        const milliseconds = this.convertMicrosecondsToMilliseconds(microseconds);
        const microsecondsString = microseconds.toString().substring(13);
        return dayjs.utc(milliseconds).format(`YYYY-MM-DDTHH:mm:ss.SSS${microsecondsString}[Z]`);
    }
    convertMicrosecondsToDate(microseconds) {
        return this.convertStringDateToDate(this.convertMicrosecondsToStringDate(microseconds));
    }
}
exports.Timer = Timer;
