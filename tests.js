"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var simplertime_1 = require("./simplertime");
function mod(x, d) {
    var m = x % d;
    return m + (m < 0 ? d : 0);
}
function testKeyToDate(key) {
    var before = key.substr(0, 1) === '<';
    if (before)
        key = key.substr(1);
    var num = parseFloat(key), h = num / 100 | 0;
    var m = num % 100 | 0, part = num % 1 * 60;
    var s = part | 0, ms = part % 1 * 1000 | 0;
    // Month is zero-based
    return before ? Date.UTC(1969, 11, 31, h, m, s, ms)
        : Date.UTC(1970, 0, 1, h, m, s, ms);
}
// TODO: convert to use unit test framework
function runParseTimeTests() {
    var testCases = {
        '1300': ['1:00 pm', '1:00 P.M.', '1:00 p', '1:00pm', '1:00p.m.', '1:00p', '1 pm',
            '1 p.m.', '1 p', '1pm', '1p.m.', '1p', '13:00', '13', '1:00:00PM', '1300', '13'],
        '1100': ['11:00am', '11:00 AM', '11:00', '11:00:00', '1100'],
        '1359': ['1:59 PM', '13:59', '13:59:00', '1359', '1359:00', '0159pm'],
        '100': ['1:00am', '1:00 am', '0100', '1', '1a', '1 am'],
        '0': ['00:00', '24:00', '12:00am', '12am', '12:00:00 AM', '0000', '1200 AM'],
        '30': ['0:30', '00:30', '24:30', '00:30:00', '12:30:00 am', '0030', '1230am'],
        '1435': ["2:35 PM", "14:35:00.0", "1435"],
        '715.5': ["7:15:30", "7:15:30am"],
        '109': ['109'],
        '': ['12:60', '11:59:99', '-12:00', 'foo', '0660', '12345', '25:00'],
    };
    var passed = 0;
    for (var key in testCases) {
        var expected = testKeyToDate(key);
        var strings = testCases[key];
        for (var i = 0; i < strings.length; i++) {
            var result = simplertime_1.parseTime(strings[i]);
            if (result === undefined ? key !== '' : key === '' || expected !== result.valueOf()) {
                console.log("Test failed at " + key + ":\"" + strings[i] + "\" with result " + (result ? result.toUTCString() : 'undefined'));
            }
            else {
                passed++;
            }
        }
    }
    console.log(passed + ' parse tests passed.');
}
exports.runParseTimeTests = runParseTimeTests;
// TODO: convert to use unit test framework
function runTimeToStringTests() {
    var testCases = {
        '0': ['12:00 am', '00:00'], '30': ['12:30 am'],
        '730': ['7:30 am', '07:30'],
        '1159': ['11:59 am', '11:59', '11:59:00 am'],
        '1200': ['12:00 pm', '12:00', '12:00:00 pm'],
        '1259': ['12:59 pm'], '1300': ['1:00 pm'],
        '1359.75': ['1:59:45 pm', '13:59:45', '1:59:45 pm'],
        '1359.20575': ['1:59:12.345 pm', '13:59:12.345', '1:59:12.345 pm'],
        '2335': ['11:35 pm', '23:35', '11:35:00 pm', '23:35:00'],
        '2405': ['12:05 am', '00:05', '12:05:00 am', '00:05:00'],
        '2809.5': ['4:09:30 am', '04:09:30', '4:09:30 am', '04:09:30'],
        '<2355': ['11:55 pm'],
        '<2249.5': ['10:49:30 pm', '22:49:30'],
        '<303': ['3:03 am', '03:03']
    };
    for (var key in testCases) {
        var time = testKeyToDate(key);
        for (var i = 0; i < testCases[key].length; i++) {
            var expected = testCases[key][i];
            var use24hourTime = (i & 1) !== 0;
            var showSeconds = i < 2 ? undefined : true;
            var result = simplertime_1.timeToStringUTC(time, use24hourTime, showSeconds);
            if (result !== expected) {
                console.log("Wrong string for " + key + ": got \"" + result + "\", expected \"" + expected + "\"");
            }
        }
    }
}
exports.runTimeToStringTests = runTimeToStringTests;
console.log("Local time: " + simplertime_1.timeToString(Date.now(), true, false) + " / " + simplertime_1.timeToString(Date.now(), false, true));
runTimeToStringTests();
runParseTimeTests();
console.log("Tests finished.");
