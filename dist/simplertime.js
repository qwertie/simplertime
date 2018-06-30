(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Parses a string into a number of seconds since midnight. Supports several
     * formats: "12", "1234", "12:34", "12:34pm", "12:34 PM", "12:34:56 pm", and "12:34:56.789".
     * The time must be at the beginning of the string but can have leading spaces.
     * Anything is allowed after the time as long as the time itself appears to
     * be valid, e.g. "12:34*Z" is OK but "12345" is not.
     * @param {string} t Time string, e.g. "1435" or "2:35 PM" or "14:35:00.0"
     * @param {Date|undefined} localDate If this parameter is provided, it is
     *        cloned and setHours is called on the clone, which is returned.
     * @returns {Date|number|undefined} The parsed date/time, if parsing succeeded.
     *        If a localDate was provided, this is a Date, otherwise it is a number
     *        of milliseconds since 00:00 midnight. In the latter case, the number
     *        is not wrapped in a Date because it could be interpreted as a time
     *        on January 1, 1970, which does not necessarily round-trip correctly
     *        with timeToString because Daylight Savings may be different in
     *        January 1970 than it is today. Returning a number makes it clear that
     *        the time is not intended to be interpreted as being in 1970.
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
            if (localDate !== undefined) {
                var date = new Date(localDate.valueOf());
                date.setHours(hour, min, sec, ms);
                return date;
            }
            return ((hour * 60 + min) * 60 + sec) * 1000 + ms;
        }
        return undefined;
    }
    exports.parseTime = parseTime;
    /** Calls valueOf() on the value if it is not already a number */
    function unwrapDate(date) {
        return typeof date === 'number' ? date : date.valueOf();
    }
    exports.unwrapDate = unwrapDate;
    /** Default options */
    exports.defaultTimeFormat = {
        am: " AM", pm: " PM", evening: undefined, use24hourTime: false,
        showSeconds: null, showMilliseconds: null, utc: undefined
    };
    // Helper functions for timeToStringUTC
    function twoDigit(n) { var s = n.toString(); return s.length >= 2 ? s : '0' + s; }
    function threeDigit(n) { var s = twoDigit(n); return s.length >= 3 ? s : '0' + s; }
    function get(opt, name) {
        return opt === undefined || opt[name] === undefined ? exports.defaultTimeFormat[name] : opt[name];
    }
    /**
     * Converts a Date (or number of millisec since unix epoch) to a string
     * showing the time of day in the UTC/GMT time zone.
     * @param time The Date/time to make a string from
     * @param opt Formatting options (optional). The function won't modify it.
     */
    function timeToStringUTC(time, opt) {
        time = unwrapDate(time);
        var op2 = exports.defaultTimeFormat;
        opt = opt || op2;
        var perday = 24 * 60 * 60000, ms = ((time % perday) + perday) % perday;
        var sec = ms / 1000 | 0;
        ms %= 1000;
        var min = sec / 60 | 0;
        sec %= 60;
        var hour = min / 60 | 0;
        min %= 60;
        var ssec = get(opt, 'showSeconds'), sms = get(opt, 'showMilliseconds');
        var secString = (ssec == null ? sec + ms : ssec) ? ':' + twoDigit(sec) : '';
        var suffix = (sms == null ? secString !== '' && ms : sms) ? secString + '.' + threeDigit(ms) : secString;
        if (get(opt, 'use24hourTime'))
            return twoDigit(hour) + ':' + twoDigit(min) + suffix;
        else {
            var eve = get(opt, 'evening');
            var pm = eve && (hour < 2 || hour > 17) ? eve : get(opt, hour >= 12 ? 'pm' : 'am');
            return ((hour + 11) % 12 + 1).toString() + ':' + twoDigit(min) + suffix + pm;
        }
    }
    exports.timeToStringUTC = timeToStringUTC;
    /**
     * Converts a Date (or number of millisec since unix epoch) to a string
     * showing the time of day.
     * @param time The Date/time to make a string from. It is expected to be
     *   a UTC time that you want adjusted to local time (unless you use
     *   `utc:false` to prevent adjustment). Note: time zones change over
     *   time, e.g. for daylight savings. Therefore, if you want to display
     *   a local time from the past, you must store it in a Date object with
     *   the correct date in order to get a correct time zone adjustment.
     * @param opt String formatting options (optional). The function won't modify it.
     */
    function timeToString(time, opt) {
        var ms = unwrapDate(time);
        if (!opt || opt.utc !== true) {
            // Bug fix: we can't use `new Date(time)` here because if the `time` has 
            // no date, a time zone adjustment for January 1970 is used (may be wrong).
            ms -= (typeof time === 'number' ? new Date() : time).getTimezoneOffset() * 60000;
        }
        return timeToStringUTC(ms, opt);
    }
    exports.timeToString = timeToString;
});
//# sourceMappingURL=simplertime.js.map