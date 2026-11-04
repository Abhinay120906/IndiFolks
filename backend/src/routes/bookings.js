import { Router } from 'express';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { asyncRoute,badRequest,validId,isDateInFuture } from '../lib/helpers.js';
import { requireAuth,requireRole } from '../middleware/auth.js';

export const bookingsRouter=Router();
bookingsRouter.use(requireAuth);
const populate=q=>q.populate('customer','name email profileImage').populate('artist','name email profileImage artForm specialty');

bookingsRouter.post('/',requireRole('customer'),asyncRoute(async(req,res)=>{
  const {artistId,date,message='',location,pricingPackage}=req.body;
  if(!validId(artistId)||!isDateInFuture(date)||typeof location!=='string'||!location.trim()||location.length>500||typeof message!=='string'||message.length>2000) return badRequest(res,'Provide artist, future date and location');
  const artist=await User.findOne({_id:artistId,role:'artist',isApproved:true,approvalStatus:'approved',available:true});
  if(!artist) return res.status(404).json({message:'Artist unavailable'});
  let price=artist.price,selected=null;
  if(pricingPackage) {
    selected=artist.pricing.packages.find(p=>String(p._id)===String(pricingPackage._id)&&p.name===pricingPackage.name);
    if(!selected) return badRequest(res,'Invalid pricing package');
    price=selected.price;
  }
  if(!Number.isFinite(price)||price<=0) return badRequest(res,'Artist needs a valid price');
  if(await Booking.exists({artist:artistId,date:new Date(date),status:{$in:['confirmed','completed']}})) return res.status(409).json({message:'Date is already booked'});
  const b=await Booking.create({customer:req.user._id,artist:artist._id,date:new Date(date),location:location.trim(),message,price,pricingPackage:selected?{name:selected.name,description:selected.description,duration:selected.duration}:undefined});
  res.status(201).json(await populate(Booking.findById(b._id)));
}));

bookingsRouter.get('/artist',requireRole('artist'),asyncRoute(async(req,res)=>res.json(await populate(Booking.find({artist:req.user._id}).sort({createdAt:-1}).limit(500)))));
bookingsRouter.get('/my',requireRole('customer'),asyncRoute(async(req,res)=>res.json(await populate(Booking.find({customer:req.user._id}).sort({createdAt:-1}).limit(500)))));
bookingsRouter.patch('/:id',requireRole('artist','admin'),asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid booking');
  const booking=await Booking.findById(req.params.id);
  if(!booking) return res.status(404).json({message:'Booking not found'});
  if(req.user.role==='artist'&&String(booking.artist)!==String(req.user._id)) return res.status(403).json({message:'Access denied'});
  const {status}=req.body;
  if(status==='confirmed'&&booking.status==='pending') {
    if(await Booking.exists({_id:{$ne:booking._id},artist:booking.artist,date:booking.date,status:{$in:['confirmed','completed']}})) return res.status(409).json({message:'Date already booked'});
    booking.status='confirmed';
  } else if(status==='cancelled'&&['pending','confirmed'].includes(booking.status)) {
    if(booking.paymentStatus==='paid') return res.status(409).json({message:'Paid booking requires admin refund flow'});
    booking.status='cancelled';
  } else if(status==='completed'&&booking.status==='confirmed'&&booking.paymentStatus==='paid') {
    booking.status='completed';
  } else return res.status(409).json({message:'Invalid booking transition'});
  await booking.save();res.json(await populate(Booking.findById(booking._id)));
}));
