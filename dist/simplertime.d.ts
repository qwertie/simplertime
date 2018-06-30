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
export declare function parseTime(t: string, localDate?: Date): Date | number | undefined;
/** Calls valueOf() on the value if it is not already a number */
export declare function unwrapDate(date: {
    valueOf(): number;
} | number): number;
/** Options accepted as second parameter of `timeToString` */
export interface TimeFormatOptions {
    /** String added by `timeToString` to represent AM (default: " AM") */
    am?: string;
    /** String added by `timeToString` to represent PM (default: " PM") */
    pm?: string;
    /** Optional string added instead of AM or PM for evenings (6pm to 1am) */
    evening?: string;
    /** If true, a 24-hour clock is used and AM/PM is hidden */
    use24hourTime?: boolean;
    /** Whether to include seconds in the output (null causes seconds
     *  to be shown only if seconds or milliseconds are nonzero) */
    showSeconds?: boolean | null;
    /** Whether to include milliseconds in the output when seconds are
     *  shown (null shows ms only if nonzero; this field is treated as
     *  false if showSeconds is false.) */
    showMilliseconds?: boolean | null;
    /** Whether to print the time as UTC or local time
     *  (ignored by timeToString) */
    utc?: boolean;
}
/** Default options */
export declare var defaultTimeFormat: {
    am: string;
    pm: string;
    evening: undefined;
    use24hourTime: boolean;
    showSeconds: null;
    showMilliseconds: null;
    utc: undefined;
};
/**
 * Converts a Date (or number of millisec since unix epoch) to a string
 * showing the time of day in the UTC/GMT time zone.
 * @param time The Date/time to make a string from
 * @param opt Formatting options (optional). The function won't modify it.
 */
export declare function timeToStringUTC(time: Date | number, opt?: TimeFormatOptions): string;
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
export declare function timeToString(time: Date | number, opt?: TimeFormatOptions): string;
