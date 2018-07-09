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
export function parseTime(t: string, localDate: Date): Date|undefined;
export function parseTime(t: string): number|undefined;

export function parseTime(t: string, localDate?: Date): Date|number|undefined {
  // ?: means non-capturing group and ?! is zero-width negative lookahead
  var time = t.match(/^\s*(\d\d?)(?::?(\d\d))?(?::(\d\d))?(?!\d)(\.\d+)?\s*(pm?|am?)?/i);
  if (time) {
    var hour = parseInt(time[1]), pm = (time[5] || ' ')[0].toUpperCase();
    var min = time[2] ? parseInt(time[2]) : 0;
    var sec = time[3] ? parseInt(time[3]) : 0;
    var ms = (time[4] ? parseFloat(time[4]) * 1000 : 0);
    if (pm !== ' ' && (hour == 0 || hour > 12) || hour > 24 || min >= 60 || sec >= 60)
      return undefined;
    if (pm === 'A' && hour === 12) hour = 0;
    if (pm === 'P' && hour !== 12) hour += 12;
    if (hour === 24) hour = 0;
    if (localDate !== undefined) {
      var date = new Date(localDate.valueOf());
      date.setHours(hour, min, sec, ms);
      return date;
    }
    return ((hour * 60 + min) * 60 + sec) * 1000 + ms;
  }
  return undefined;
}

/** Calls valueOf() on the value if it is not already a number.
 *  Deprecated: valueOf() exists on both Date and number, so just call that.
 */
export function unwrapDate(date: {valueOf():number}|number): number
{
  return typeof date === 'number' ? date : date.valueOf();
}

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
  showSeconds?: boolean|null;
  /** Whether to include milliseconds in the output when seconds are 
   *  shown (null shows ms only if nonzero; this field is treated as
   *  false if showSeconds is false.) */
  showMilliseconds?: boolean|null;
  /** Whether to print the time as UTC or local time 
   *  (ignored by timeToString) */
  utc?: boolean;
}

/** Default options */
export var defaultTimeFormat = {
  am: " AM", pm: " PM", evening: undefined, use24hourTime: false,
  showSeconds: null, showMilliseconds: null, utc: undefined
};

// Helper functions for timeToStringUTC
function twoDigit(n: number) { var s = n.toString(); return s.length >= 2 ? s : '0' + s; }
function threeDigit(n: number) { var s = twoDigit(n); return s.length >= 3 ? s : '0' + s; }
function get<K extends keyof TimeFormatOptions>(opt: TimeFormatOptions|undefined, name: K): TimeFormatOptions[K] {
  return opt === undefined || opt[name] === undefined ? defaultTimeFormat[name] : opt[name];
}

/**
 * Converts a Date (or number of millisec since unix epoch) to a string 
 * showing the time of day in the UTC/GMT time zone.
 * @param time The Date/time to make a string from
 * @param opt Formatting options (optional). The function won't modify it.
 */
export function timeToStringUTC(time: Date|number, opt?: TimeFormatOptions): string
{
  time = time.valueOf();
  var op2 = defaultTimeFormat;
  opt = opt || op2;
  let perday = 24*60*60000, ms = ((time % perday) + perday) % perday;
  let sec = ms / 1000 | 0; ms %= 1000;
  let min = sec / 60 | 0; sec %= 60;
  let hour = min / 60 | 0; min %= 60;
  var ssec = get(opt, 'showSeconds'), sms = get(opt, 'showMilliseconds');
  var secString = (ssec == null ? sec+ms : ssec) ? ':' + twoDigit(sec) : '';
  var suffix = (sms == null ? secString !== '' && ms : sms) ? secString + '.' + threeDigit(ms) : secString;
  if (get(opt, 'use24hourTime'))
    return twoDigit(hour) + ':' + twoDigit(min) + suffix;
  else {
    var eve = get(opt, 'evening');
    var pm = eve && (hour<2||hour>17) ? eve : get(opt, hour >= 12 ? 'pm' : 'am');
    return ((hour + 11) % 12 + 1).toString() + ':' + twoDigit(min) + suffix + pm;
  }
}

/**
 * Converts a Date (or number of milliseconds since unix epoch) to a 
 * string showing the time of day.
 * @param time The Date/time from which to make a string. It is expected 
 *   to be a UTC time that you want adjusted to local time (unless you 
 *   use `utc:false` to prevent adjustment). Note: time zones change over
 *   time, e.g. for daylight savings. Therefore, if you want to display
 *   a local time from the past, you must store it in a Date object with
 *   the correct date in order to get a correct time zone adjustment.
 * @param opt String formatting options (optional). The function won't modify it.
 */
export function timeToString(time: Date|number, opt?: TimeFormatOptions): string
{
  let ms = time.valueOf();
  if (!opt || opt.utc !== true) {
    // Bug fix: we can't use `new Date(time)` here because if the `time` has 
    // no date, a time zone adjustment for January 1970 is used (may be wrong).
    ms -= (typeof time === 'number' ? new Date() : time).getTimezoneOffset() * 60000;
  }
  return timeToStringUTC(ms, opt);
}
