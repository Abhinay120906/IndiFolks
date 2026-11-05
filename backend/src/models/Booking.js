import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  location: { type: String, required: true, trim: true, maxlength: 500 },
  message: { type: String, maxlength: 2000, default: '' },
  price: { type: Number, min: 1, required: true },
  pricingPackage: { name: String, description: String, duration: String },
  status: {
    type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending', index: true
  },
  // "demo_paid" is never a real payment or Razorpay settlement.
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'demo_paid', 'refunded'], default: 'unpaid' },
  demoPaymentId: String,
  demoPaidAt: Date,
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: String,
  paidAt: Date
}, { timestamps: true });

bookingSchema.index({ artist: 1, date: 1 });
export const Booking = mongoose.model('Booking', bookingSchema);
