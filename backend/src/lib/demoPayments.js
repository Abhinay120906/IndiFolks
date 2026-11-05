// Pure eligibility check; keep this separate for deterministic unit testing.
export function canSimulatePayment(booking) {
  return Boolean(booking && booking.status === 'confirmed' && booking.paymentStatus === 'unpaid');
}
