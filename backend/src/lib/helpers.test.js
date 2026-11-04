import test from 'node:test';
import assert from 'node:assert/strict';
import { safeNumber, validId, isDateInFuture, parseJson } from './helpers.js';

test('safeNumber retains valid numeric values', () => {
  assert.equal(safeNumber('2500'), 2500);
  assert.ok(Number.isNaN(safeNumber('not-a-number', NaN)));
});
test('validId rejects malformed ObjectIds', () => {
  assert.equal(validId('not-an-id'), false);
  assert.equal(validId('507f1f77bcf86cd799439011'), true);
});
test('isDateInFuture checks dates', () => {
  assert.equal(isDateInFuture('invalid-date'), false);
  assert.equal(isDateInFuture('2000-01-01'), false);
  assert.equal(isDateInFuture('2099-01-01'), true);
});
test('parseJson handles invalid JSON', () => {
  assert.deepEqual(parseJson('{"ok":true}', {}), {ok:true});
  assert.deepEqual(parseJson('broken', []), []);
});
