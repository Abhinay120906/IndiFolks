import test from 'node:test';
import assert from 'node:assert/strict';
import { indiaDayKey, dayRange, requestedIndiaDay, bookingDateForDay, monthRange } from './bookingDates.js';

test('legacy MongoDB UTC timestamps resolve to the India booking day', () => {
  assert.equal(indiaDayKey('2026-11-15T18:30:00.000Z'), '2026-11-16');
  assert.equal(indiaDayKey('2026-11-14T18:30:00.000Z'), '2026-11-15');
});
test('day ranges include the full Indian calendar day and exclude the next', () => {
  const { start, end } = dayRange('2026-11-16');
  assert.equal(start.toISOString(), '2026-11-15T18:30:00.000Z');
  assert.equal(end.toISOString(), '2026-11-16T18:30:00.000Z');
  assert.equal(indiaDayKey(bookingDateForDay('2026-11-16')), '2026-11-16');
  assert.equal(requestedIndiaDay('2026-11-16'), '2026-11-16');
  assert.equal(requestedIndiaDay('2026-11-15T18:30:00Z'), '2026-11-16');
});
test('invalid dates and months are rejected', () => {
  assert.equal(dayRange('2026-02-30'), null);
  assert.equal(dayRange('tomorrow'), null);
  assert.equal(requestedIndiaDay('2026-02-30'), null);
  assert.equal(monthRange('2026-13'), null);
});
test('monthly availability range spans the correct month', () => {
  assert.equal(monthRange('2026-11').start.toISOString(), '2026-10-31T18:30:00.000Z');
  assert.equal(monthRange('2026-11').end.toISOString(), '2026-11-30T18:30:00.000Z');
});
