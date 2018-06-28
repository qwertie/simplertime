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
export declare function parseTime(t: string, localDate?: Date): Date | undefined;
/** Calls valueOf() on the value if it is not already a number */
export declare function unwrapDate(date: {
    valueOf(): number;
} | number): number;
/** String used by `timeToString` to represent AM/PM (default: " am" and " pm") */
export declare var amString: string, pmString: string;
/**
 * Converts a Date (or number of millisec since unix epoch) to a string showing the time of day in the GMT time zone.
 * @param time The Date/time to make a string from
 * @param use24hourTime If false, am or pm time is used.
 * @param showSeconds Whether to show the number of seconds (and milliseconds, if nonzero)
 */
export declare function timeToStringUTC(time: Date | number, use24hourTime: boolean, showSeconds?: boolean): string;
/**
 * Converts a Date (or number of millisec since unix epoch) to a string showing the time of day.
 * @param time The Date/time to make a string from
 * @param use24hourTime If false, am or pm time is used.
 * @param showSeconds Whether to show the number of seconds (and milliseconds, if nonzero)
 * @param utc Whether the time should be interpreted as a local time or as UTC
 */
export declare function timeToString(time: Date | number, use24hourTime: boolean, showSeconds?: boolean, utc?: boolean): string;
