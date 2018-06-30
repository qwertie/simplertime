"simplertime" time-of-day library
---------------------------------

Parses and prints time values stored as Date or number (number of milliseconds since midnight). Full documentation is in the [source code](https://github.com/qwertie/simplertime/blob/master/simplertime.ts).

### Examples ###

~~~js
var now = Date.now();
console.log("Local time (24-hour clock on, seconds off): " + 
            timeToString(now, {use24hourTime: true, showSeconds: false}));
console.log("Local time (24-hour clock off, seconds on): " +
            timeToString(now, {use24hourTime: false, showSeconds: true}));

var fmt = {
  am: " in the morning", 
  pm: " in the afternoon", 
  evening: " in the evening"
};
var later = now + parseTime("7:15").valueOf();
console.log("Seven hours and 15 minutes later is " + timeToString(later, fmt));
console.log("Which in UTC time is .............. " + timeToStringUTC(later, fmt));
console.log("Noon UTC converted to local time is " +
            timeToString(parseTime("12PM"), fmt));
console.log("Noon local time converted to UTC is " +
            timeToStringUTC(parseTime("12PM", new Date()), fmt));
~~~
