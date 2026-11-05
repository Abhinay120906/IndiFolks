import { Router } from 'express';
import crypto from 'node:crypto';
import { Booking } from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncRoute, badRequest, validId } from '../lib/helpers.js';
import { canSimulatePayment } from '../lib/demoPayments.js';

export const demoPaymentsRouter = Router();

// Deliberately unavailable unless the project owner opts in to demo-only payments.
// Never put payment-card details, banking details, or live transaction credentials here.
demoPaymentsRouter.use(requireAuth, requireRole('customer', 'artist'));
// Artists may also be event hosts; payment ownership is still verified by booking.customer.
demoPaymentsRouter.post('/confirm', asyncRoute(async (req, res) => {
  if (process.env.ENABLE_DEMO_PAYMENTS !== 'true') {
    return res.status(503).json({ message: 'Demonstration payments are disabled on this server' });
  }

  const { bookingId, acknowledgement } = req.body || {};
  if (!validId(bookingId) || acknowledgement !== 'SIMULATE') {
    return badRequest(res, 'Select a valid booking and explicitly confirm simulation');
  }

  // Use only the saved server-side booking amount. Ownership and the accepted
  // status are checked atomically to prevent cross-customer writes or repeats.
  const demoPaymentId = 'demo_' + crypto.randomUUID();
  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      customer: req.user._id,
      status: 'confirmed',
      paymentStatus: 'unpaid'
    },
    {
      $set: {
        paymentStatus: 'demo_paid',
        demoPaymentId,
        demoPaidAt: new Date()
      }
    },
    { new: true, runValidators: true }
  );

  if (booking) {
    console.info('IndiFolks DEMO payment recorded for booking', String(booking._id));
    return res.json({
      success: true,
      simulated: true,
      message: 'Demo payment recorded. No real money was charged.',
      booking
    });
  }

  const existing = await Booking.findOne({ _id: bookingId, customer: req.user._id });
  if (!existing) return res.status(404).json({ message: 'Booking not found' });
  if (existing.paymentStatus === 'demo_paid') {
    return res.json({
      success: true,
      simulated: true,
      alreadySimulated: true,
      message: 'This booking was already marked demo-paid. No money was charged.',
      booking: existing
    });
  }
  if (!canSimulatePayment(existing)) {
    return res.status(409).json({ message: 'Artist must confirm an unpaid booking before simulating payment' });
  }
  return res.status(409).json({ message: 'Booking payment state changed; refresh and try again' });
}));
