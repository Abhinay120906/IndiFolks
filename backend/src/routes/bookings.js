import { Router } from 'express';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { asyncRoute,badRequest,validId } from '../lib/helpers.js';
import { indiaDayKey,requestedIndiaDay,dayRange,bookingDateForDay } from '../lib/bookingDates.js';
import { requireAuth,requireRole } from '../middleware/auth.js';
import { canBookArtist } from '../lib/marketplaceAccess.js';

export const bookingsRouter=Router();
bookingsRouter.use(requireAuth);
const populate=q=>q.populate('customer','name email profileImage').populate('artist','name email profileImage artForm specialty');

bookingsRouter.post('/',requireRole('customer','artist'),asyncRoute(async(req,res)=>{
  const {artistId,date,message='',location,pricingPackage}=req.body;
  const eventDay=requestedIndiaDay(date);
  if(!validId(artistId)||!eventDay||eventDay<=indiaDayKey(new Date())||
    typeof location!=='string'||!location.trim()||location.length>500||
    typeof message!=='string'||message.length>2000) {
    return badRequest(res,'Select a future available date and provide an event location');
  }
  if(!canBookArtist(req.user,artistId)) return res.status(403).json({message:'You cannot book your own artist profile'});
  const artist=await User.findOne({_id:artistId,role:'artist',isApproved:true,approvalStatus:'approved',available:true});
  if(!artist) return res.status(404).json({message:'Artist unavailable'});
  let price=artist.price,selected=null;
  if(pricingPackage) {
    selected=artist.pricing.packages.find(p=>String(p._id)===String(pricingPackage._id)&&p.name===pricingPackage.name);
    if(!selected) return badRequest(res,'Invalid pricing package');
    price=selected.price;
  }
  if(!Number.isFinite(price)||price<=0) return badRequest(res,'Artist needs a valid price');
  const {start,end}=dayRange(eventDay);
  if(await Booking.exists({artist:artist._id,date:{$gte:start,$lt:end},status:{$in:['confirmed','completed']}})) {
    return res.status(409).json({message:'This date is already booked. Please choose a green date from the calendar.'});
  }
  const b=await Booking.create({customer:req.user._id,artist:artist._id,
    date:bookingDateForDay(eventDay),eventDay,
    location:location.trim(),message,price,
    pricingPackage:selected?{name:selected.name,description:selected.description,duration:selected.duration}:undefined});
  res.status(201).json(await populate(Booking.findById(b._id)));
}));

bookingsRouter.get('/artist',requireRole('artist'),asyncRoute(async(req,res)=>res.json(await populate(Booking.find({artist:req.user._id}).sort({createdAt:-1}).limit(500)))));
bookingsRouter.get('/my',requireRole('customer','artist'),asyncRoute(async(req,res)=>res.json(await populate(Booking.find({customer:req.user._id}).sort({createdAt:-1}).limit(500)))));
bookingsRouter.patch('/:id',requireRole('artist','admin'),asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid booking');
  const booking=await Booking.findById(req.params.id);
  if(!booking) return res.status(404).json({message:'Booking not found'});
  if(req.user.role==='artist'&&String(booking.artist)!==String(req.user._id)) return res.status(403).json({message:'Access denied'});
  const {status}=req.body;
  if(status==='confirmed'&&booking.status==='pending') {
    const eventDay=booking.eventDay||indiaDayKey(booking.date);
    const range=dayRange(eventDay);
    if(!range) return badRequest(res,'Invalid event date');
    if(await Booking.exists({_id:{$ne:booking._id},artist:booking.artist,
      date:{$gte:range.start,$lt:range.end},status:{$in:['confirmed','completed']}})) {
      return res.status(409).json({message:'The artist already has a confirmed event on this date'});
    }
    booking.eventDay=eventDay;
    booking.status='confirmed';
  } else if(status==='cancelled'&&['pending','confirmed'].includes(booking.status)) {
    if(['paid','demo_paid'].includes(booking.paymentStatus)) return res.status(409).json({message:'Paid or simulated-paid booking cannot be cancelled through this endpoint'});
    booking.status='cancelled';
  } else if(status==='completed'&&booking.status==='confirmed'&&(booking.paymentStatus==='paid'||(process.env.ENABLE_DEMO_PAYMENTS==='true'&&booking.paymentStatus==='demo_paid'))) {
    booking.status='completed';
  } else return res.status(409).json({message:'Invalid booking transition'});
  await booking.save();res.json(await populate(Booking.findById(booking._id)));
}));
