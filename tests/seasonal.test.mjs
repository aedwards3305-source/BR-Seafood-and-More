// Tests for the seasonal date windows in js/seasonal.js.
// Run: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SeasonalCalendar: C, Seasonal } = require('../js/seasonal.js');

const at = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);
const keyOn = (y, m, d) => C.seasonOn(at(y, m, d))?.key ?? null;

test('Halloween runs Oct 20 through Nov 2 inclusive', () => {
  assert.equal(keyOn(2026, 10, 19), null);
  assert.equal(keyOn(2026, 10, 20), 'halloween');
  assert.equal(keyOn(2026, 10, 24), 'halloween');
  assert.equal(keyOn(2026, 11, 2), 'halloween');
  assert.equal(keyOn(2026, 11, 3), null);
});

test('Thanksgiving 2026 falls on Nov 26, so its week is Nov 23 - 29', () => {
  const tg = C.thanksgiving(2026);
  assert.equal(tg.getMonth(), 10);
  assert.equal(tg.getDate(), 26);
  assert.equal(tg.getDay(), 4, 'Thanksgiving is a Thursday');
  assert.equal(keyOn(2026, 11, 22), null);
  assert.equal(keyOn(2026, 11, 23), 'thanksgiving');
  assert.equal(keyOn(2026, 11, 29), 'thanksgiving');
  assert.equal(keyOn(2026, 11, 30), null);
});

test('Christmas and New Year window runs Dec 15 through Jan 1', () => {
  assert.equal(keyOn(2026, 12, 14), null);
  assert.equal(keyOn(2026, 12, 15), 'christmas');
  assert.equal(C.seasonOn(at(2026, 12, 25)).greeting, 'Merry Christmas from B&R Seafood and More!');
  assert.equal(C.seasonOn(at(2027, 1, 1)).greeting, 'Happy New Year from B&R Seafood and More!');
  assert.equal(keyOn(2027, 1, 2), null);
});

test('federal holiday dates for 2026 match the calendar rules', () => {
  const byKey = Object.fromEntries(C.federalHolidays(2026).map((h) => [h.key, h.date]));
  const ymd = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
  assert.equal(ymd(byKey.mlk), '1/19');
  assert.equal(ymd(byKey.presidents), '2/16');
  assert.equal(ymd(byKey.memorial), '5/25');
  assert.equal(ymd(byKey.juneteenth), '6/19');
  assert.equal(ymd(byKey.independence), '7/4');
  assert.equal(ymd(byKey.labor), '9/7');
  assert.equal(ymd(byKey.columbus), '10/12');
  assert.equal(ymd(byKey.veterans), '11/11');
});

test('a federal holiday window is 3 days before through 1 day after', () => {
  // Juneteenth 2026 is Jun 19
  assert.equal(keyOn(2026, 6, 15), null);
  assert.equal(keyOn(2026, 6, 16), 'federal');
  assert.equal(keyOn(2026, 6, 20), 'federal');
  assert.equal(keyOn(2026, 6, 21), null);
  assert.equal(C.seasonOn(at(2026, 6, 19)).greeting, 'Happy Juneteenth from B&R Seafood and More!');
});

test('Veterans Day gets its own greeting', () => {
  assert.equal(C.seasonOn(at(2026, 11, 11)).greeting, 'Thank you to our veterans, from B&R Seafood and More!');
});

test('the greeting for a federal holiday uses its name', () => {
  assert.equal(C.seasonOn(at(2026, 7, 4)).greeting, 'Happy Independence Day from B&R Seafood and More!');
  assert.equal(C.seasonOn(at(2026, 9, 7)).greeting, 'Happy Labor Day from B&R Seafood and More!');
});

test('ordinary days show no season', () => {
  assert.equal(keyOn(2026, 3, 10), null);
  assert.equal(keyOn(2026, 8, 20), null);
});

test('resolve: the settings switch turns the date theme off', () => {
  assert.equal(Seasonal.resolve(at(2026, 10, 24), false, null), null);
  assert.equal(Seasonal.resolve(at(2026, 10, 24), true, null).key, 'halloween');
});

test('resolve: a preview parameter overrides the date, and off clears it', () => {
  assert.equal(Seasonal.resolve(at(2026, 3, 10), true, 'thanksgiving').key, 'thanksgiving');
  assert.equal(Seasonal.resolve(at(2026, 10, 24), true, 'off'), null);
});
