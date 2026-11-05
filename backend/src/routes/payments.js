import { Router } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { Booking } from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncRoute, badRequest, validId } from '../lib/helpers.js';

export const paymentsRouter = Router();
let gatewayClient;
function razorpay() {
 const { RAZORPAY_KEY_ID: id, RAZORPAY_KEY_SECRET: secret } = process.env;
 if(!id || !secret || !id.startsWith('rzp_test_')) {
  const err=new Error('Configure Razorpay TEST credentials on the backend');err.status=503;throw err;
 }
 if(!gatewayClient) gatewayClient=new Razorpay({key_id:id,key_secret:secret});
 return gatewayClient;
}
function equalsHex(a,b) {
 if(typeof a!=='string'||typeof b!=='string'||!/^[0-9a-f]{64}$/i.test(b)) return false;
 const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');
 return x.length===y.length&&crypto.timingSafeEqual(x,y);
}
paymentsRouter.post('/orders',requireAuth,requireRole('customer','artist'),asyncRoute(async(req,res)=>{
 const {bookingId}=req.body;
 if(!validId(bookingId)) return badRequest(res,'Invalid booking ID');
 const booking=await Booking.findOne({_id:bookingId,customer:req.user._id});
 if(!booking) return res.status(404).json({message:'Booking not found'});
 if(booking.status!=='confirmed'||booking.paymentStatus!=='unpaid') return res.status(409).json({message:'Booking is not awaiting payment'});
 const amount=Math.round(booking.price*100);
 if(!Number.isSafeInteger(amount)||amount<100) return badRequest(res,'Booking amount is invalid');
 if(!booking.razorpayOrderId) {
  const order=await razorpay().orders.create({amount,currency:'INR',receipt:String(booking._id)});
  booking.razorpayOrderId=order.id;
  await booking.save();
 }
 res.json({keyId:process.env.RAZORPAY_KEY_ID,orderId:booking.razorpayOrderId,bookingId:String(booking._id),amount,currency:'INR'});
}));
paymentsRouter.post('/verify',requireAuth,requireRole('customer','artist'),asyncRoute(async(req,res)=>{
 const {bookingId,razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body;
 if(![bookingId,orderId,paymentId,signature].every(x=>typeof x==='string')||!validId(bookingId)) return badRequest(res,'Payment details missing');
 const booking=await Booking.findOne({_id:bookingId,customer:req.user._id});
 if(!booking||booking.razorpayOrderId!==orderId) return res.status(404).json({message:'Payment order not found'});
 if(booking.paymentStatus==='paid' && booking.razorpayPaymentId===paymentId) return res.json({success:true,booking});
 if(booking.status!=='confirmed'||booking.paymentStatus!=='unpaid') return res.status(409).json({message:'Booking not payable'});
 const digest=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(orderId+'|'+paymentId).digest('hex');
 if(!equalsHex(digest,signature)) return res.status(400).json({message:'Payment signature verification failed'});
 const payment=await razorpay().payments.fetch(paymentId);
 if(payment.order_id!==orderId||payment.status!=='captured'||payment.currency!=='INR'||Number(payment.amount)!==Math.round(booking.price*100)) return res.status(409).json({message:'Payment not captured for this order'});
 const other=await Booking.exists({_id:{$ne:booking._id},razorpayPaymentId:paymentId});
 if(other) return res.status(409).json({message:'Payment already assigned elsewhere'});
 booking.paymentStatus='paid';booking.razorpayPaymentId=paymentId;booking.paidAt=new Date();
 await booking.save();
 res.json({success:true,booking});
}));
