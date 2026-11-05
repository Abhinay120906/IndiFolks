import test from 'node:test';
import assert from 'node:assert/strict';
import { canSimulatePayment } from './demoPayments.js';

test('only confirmed and unpaid bookings may be simulated', () => {
  assert.equal(canSimulatePayment({ status: 'confirmed', paymentStatus: 'unpaid' }), true);
  for (const status of ['pending', 'completed', 'cancelled']) {
    assert.equal(canSimulatePayment({ status, paymentStatus: 'unpaid' }), false);
  }
  for (const paymentStatus of ['paid', 'demo_paid', 'refunded']) {
    assert.equal(canSimulatePayment({ status: 'confirmed', paymentStatus }), false);
  }
  assert.equal(canSimulatePayment(null), false);
});
