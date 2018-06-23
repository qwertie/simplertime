"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parses a string into a Date. Supports several formats: "12", "1234",
 * "12:34", "12:34pm", "12:34 PM", "12:34:56 pm", and "12:34:56.789".
 * The time must be at the beginning of the string but can have leading spaces.
 * Anything is allowed after the time as long as the time itself appears to
 * be valid, e.g. "12:34*Z" is OK but "12345" is not.
 * @param {string} t Time string, e.g. "1435" or "2:35 PM" or "14:35:00.0"
 * @param {Date|undefined} localDate If this parameter is provided, setHours
 *        is called on it. Otherwise, setUTCHours is called on 1970/1/1.
 * @returns {Date|undefined} The parsed date, if parsing succeeded.
 */
function parseTime(t, localDate) {
    // ?: means non-capturing group and ?! is zero-width negative lookahead
    var time = t.match(/^\s*(\d\d?)(?::?(\d\d))?(?::(\d\d))?(?!\d)(\.\d+)?\s*(pm?|am?)?/i);
    if (time) {
        var hour = parseInt(time[1]), pm = (time[5] || ' ')[0].toUpperCase();
        var min = time[2] ? parseInt(time[2]) : 0;
        var sec = time[3] ? parseInt(time[3]) : 0;
        var ms = (time[4] ? parseFloat(time[4]) * 1000 : 0);
        if (pm !== ' ' && (hour == 0 || hour > 12) || hour > 24 || min >= 60 || sec >= 60)
            return undefined;
        if (pm === 'A' && hour === 12)
            hour = 0;
        if (pm === 'P' && hour !== 12)
            hour += 12;
        if (hour === 24)
            hour = 0;
        var date = new Date(localDate !== undefined ? localDate.valueOf() : 0);
        var set = (localDate !== undefined ? date.setHours : date.setUTCHours);
        set.call(date, hour, min, sec, ms);
        return date;
    }
    return undefined;
}
exports.parseTime = parseTime;
/** Calls valueOf() on the value if it is not already a number */
function unwrapDate(date) {
    return typeof date === 'number' ? date : date.valueOf();
}
exports.unwrapDate = unwrapDate;
/** String used by `timeToString` to represent AM/PM (default: " am" and " pm") */
exports.amString = " am", exports.pmString = " pm";
/**
 * Converts a Date (or number of millisec since unix epoch) to a string showing the time of day in the GMT time zone.
 * @param time The Date/time to make a string from
 * @param use24hourTime If false, am or pm time is used.
 * @param showSeconds Whether to show the number of seconds (and milliseconds, if nonzero)
 */
function timeToStringUTC(time, use24hourTime, showSeconds) {
    time = unwrapDate(time);
    var perday = 24 * 60 * 60000, ms = ((time % perday) + perday) % perday;
    var sec = ms / 1000 | 0;
    ms %= 1000;
    var min = sec / 60 | 0;
    sec %= 60;
    var hour = min / 60 | 0;
    min %= 60;
    var secString = (showSeconds === undefined ? sec != 0 || ms != 0 : showSeconds) ? ':' + twoDigit(sec) : '';
    var suffix = secString !== '' && ms != 0 ? secString + '.' + threeDigit(ms) : secString;
    var result;
    if (use24hourTime)
        result = twoDigit(hour) + ':' + twoDigit(min) + suffix;
    else {
        var pm = hour >= 12;
        result = ((hour + 11) % 12 + 1).toString() + ':' + twoDigit(min) + suffix + (pm ? exports.pmString : exports.amString);
    }
    return result;
    function twoDigit(n) { var s = n.toString(); return s.length >= 2 ? s : '0' + s; }
    function threeDigit(n) { var s = twoDigit(n); return s.length >= 3 ? s : '0' + s; }
}
exports.timeToStringUTC = timeToStringUTC;
/**
 * Converts a Date (or number of millisec since unix epoch) to a string showing the time of day.
 * @param time The Date/time to make a string from
 * @param use24hourTime If false, am or pm time is used.
 * @param showSeconds Whether to show the number of seconds (and milliseconds, if nonzero)
 * @param utc Whether the time should be interpreted as a local time or as UTC
 */
function timeToString(time, use24hourTime, showSeconds, utc) {
    if (typeof time === 'number')
        time = new Date(time);
    var ms = time.valueOf();
    if (utc !== true)
        ms -= time.getTimezoneOffset() * 60000;
    return timeToStringUTC(ms, use24hourTime, showSeconds);
}
exports.timeToString = timeToString;
