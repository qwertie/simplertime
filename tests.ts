import {
  parseTime, timeToString, timeToStringUTC, defaultTimeFormat
} from 'simplertime';

function testKeyToDate(key: string): number // NaN if empty key
{
  var before = key.substr(0,1)==='<';
  if (before)
    key = key.substr(1);
  let num = parseFloat(key), h = num / 100 | 0;
  let m = num % 100 | 0, part = num % 1 * 60;
  let s = part | 0, ms = part % 1 * 1000 | 0;
  // Month is zero-based
  return before ? Date.UTC(1969, 11, 31, h, m, s, ms) 
                : Date.UTC(1970, 0, 1, h, m, s, ms);
}

// TODO: convert to use unit test framework
function runParseTimeTests()
{
  var testCases: any = {
    '1300':  ['1:00 pm','1:00 P.M.','1:00 p','1:00pm','1:00p.m.','1:00p','1 pm',
              '1 p.m.','1 p','1pm','1p.m.', '1p', '13:00','13', '1:00:00PM', '1300', '13'],
    '1100':  ['11:00am', '11:00 AM', '11:00', '11:00:00', '1100'],
    '1359':  ['1:59 PM', '13:59', '13:59:00', '1359', '1359:00', '0159pm'],
    '100':   ['1:00am', '1:00 am', '0100', '1', '1a', '1 am'],
    '0':     ['00:00', '24:00', '12:00am', '12am', '12:00:00 AM', '0000', '1200 AM'],
    '30':    ['0:30', '00:30', '24:30', '00:30:00', '12:30:00 am', '0030', '1230am'],
    '1435':  ["2:35 PM", "14:35:00.0", "1435"],
    '715.5': ["7:15:30", "7:15:30am"],
    '109':   ['109'], // Three-digit numbers work (I wasn't sure if they would)
    '':      ['12:60', '11:59:99', '-12:00', 'foo', '0660', '12345', '25:00'],
  };

  var passed = 0;
  for (var key in testCases) {
    let expected = testKeyToDate(key);
    let strings = testCases[key];
    for (let i = 0; i < strings.length; i++) {
      var result = parseTime(strings[i]);
      if (result !== undefined ? key === '' || expected !== result.valueOf() : key !== '') {
        console.log(`Test failed at ${key}:"${strings[i]}" with result ${result}`);
      } else {
        passed++;
      }
    }
  }
  console.log(passed + ' parse tests passed.');
}

// TODO: convert to use unit test framework
function runTimeToStringTests()
{
  let testCases: any = {
    '0': ['12:00 AM', '00:00'],   '30': ['12:30 AM'],
    '730': ['7:30 AM', '07:30'], 
    '1159': ['11:59 AM', '11:59', '11:59:00 AM'],
    '1200': ['12:00 PM', '12:00', '12:00:00 PM'],
    '1259': ['12:59 PM'], '1300': ['1:00 PM'], 
    '1359.75': ['1:59:45 PM', '13:59:45', '1:59:45 PM'],
    '1359.20575': ['1:59:12.345 PM', '13:59:12.345', '1:59:12.345 PM'],
    '2335': ['11:35 PM', '23:35', '11:35:00 PM', '23:35:00'],
    '2405': ['12:05 AM', '00:05', '12:05:00 AM', '00:05:00'],
    '2809.5': ['4:09:30 AM', '04:09:30', '4:09:30 AM', '04:09:30'],
    '<2355': ['11:55 PM'], 
    '<2249.5': ['10:49:30 PM', '22:49:30'],
    '<303': ['3:03 AM', '03:03']
  };
  for (var key in testCases) {
    let time = testKeyToDate(key);
    for (let i = 0; i < testCases[key].length; i++) {
      let expected = testCases[key][i];
      let use24hourTime = (i & 1) !== 0;
      let showSeconds = i < 2 ? undefined : true;
      var result = timeToStringUTC(time, {use24hourTime, showSeconds});
      if (result !== expected) {
        console.log(`Wrong string for ${key}: got "${result}", expected "${expected}"`);
      }
    }
  }
}

runTimeToStringTests();
runParseTimeTests();

var now = Date.now();
console.log("Local time (24-hour clock on, seconds off): " + 
            timeToString(now, {use24hourTime: true, showSeconds: false}));
console.log("Local time (24-hour clock off, seconds on): " +
            timeToString(now, {use24hourTime: false, showSeconds: true}));

Object.assign(defaultTimeFormat, {
  am: " in the morning", 
  pm: " in the afternoon", 
  evening: " in the evening"
});
var later = now + parseTime("7:15")!;
console.log("Seven hours and 15 minutes later is: " + timeToString(later));
console.log("Which in UTC time is:                " + timeToStringUTC(later));
console.log("Noon UTC converted to local time is: " + timeToString(parseTime("12PM")!));
console.log("Noon local time converted to UTC is: " + timeToStringUTC(parseTime("12PM", new Date())!));
console.log(`(UTC offset: ${new Date().getTimezoneOffset()/60} hours)`);
console.log("Tests finished.");
