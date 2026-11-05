import test from 'node:test';
import assert from 'node:assert/strict';
import { canActAsBuyer, canBookArtist } from './marketplaceAccess.js';

test('customer and artist accounts can browse and make bookings', () => {
  assert.equal(canActAsBuyer({ role:'customer' }), true);
  assert.equal(canActAsBuyer({ role:'artist' }), true);
  assert.equal(canActAsBuyer({ role:'admin' }), false);
  assert.equal(canActAsBuyer(null), false);
});
test('an artist may book a competing artist, not their own profile', () => {
  assert.equal(canBookArtist({_id:'a',role:'artist'}, 'b'),true);
  assert.equal(canBookArtist({_id:'a',role:'artist'}, 'a'),false);
  assert.equal(canBookArtist({_id:'a',role:'customer'}, 'b'),true);
  assert.equal(canBookArtist({_id:'a',role:'admin'}, 'b'),false);
  assert.equal(canBookArtist(null, 'b'),false);
});
