import { Router } from 'express';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { imageUpload, uploadImage } from '../lib/upload.js';
import { asyncRoute, badRequest, validId, parseJson, safeNumber } from '../lib/helpers.js';

export const artistsRouter = Router();
function displayArtist(user) {
  const u = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const reviews = u.reviews || [];
  const rating = reviews.length ? reviews.reduce((s,r)=>s+r.rating,0)/reviews.length : 0;
  return {...u,rating:Math.round(rating*10)/10,totalReviews:reviews.length,adminFee:Math.round((u.price||0)*0.05),totalPrice:Math.round((u.price||0)*1.05)};
}
artistsRouter.get('/',asyncRoute(async(req,res)=>{
  const filter={role:'artist',approvalStatus:'approved',isApproved:true};
  if(typeof req.query.state==='string' && req.query.state!=='All States') filter.state=req.query.state;
  if(typeof req.query.artForm==='string' && req.query.artForm!=='All Art Forms') filter.$or=[{artForm:req.query.artForm},{specialty:req.query.artForm}];
  if(typeof req.query.search==='string' && req.query.search.trim()) {
    const term=req.query.search.trim().slice(0,80).replace(/[.*+?^$()|[\]{}]/g,'\\$&');
    const pattern=new RegExp(term,'i');
    filter.$and=[{$or:[{name:pattern},{specialty:pattern},{artForm:pattern},{state:pattern}]}];
  }
  const artists=(await User.find(filter).limit(500).lean()).map(displayArtist);
  const sort=req.query.sort;
  if(sort==='reviews') artists.sort((a,b)=>b.totalReviews-a.totalReviews);
  else if(sort==='price-low') artists.sort((a,b)=>a.price-b.price);
  else if(sort==='price-high') artists.sort((a,b)=>b.price-a.price);
  else artists.sort((a,b)=>b.rating-a.rating);
  const limit=Math.min(100,Math.max(1,Number(req.query.limit)||100));
  res.json(artists.slice(0,limit));
}));
artistsRouter.get('/me',requireAuth,requireRole('artist'),(req,res)=>res.json(displayArtist(req.user)));
artistsRouter.put('/profile',requireAuth,requireRole('artist'),imageUpload.array('images',8),asyncRoute(async(req,res)=>{
  const user=req.user;
  for(const key of ['name','bio','specialty','experience','story','awards','state','artForm']) {
    if(req.body[key]!==undefined) {
      if(typeof req.body[key]!=='string') return badRequest(res,'Invalid '+key);
      user[key]=req.body[key].slice(0,key==='story'?5000:key==='bio'?3000:500);
    }
  }
  if(req.body.price!==undefined) {
    const n=safeNumber(req.body.price,NaN);
    if(!Number.isFinite(n)||n<0||n>10000000) return badRequest(res,'Invalid artist price');
    user.price=n;
  }
  if(req.body.available!==undefined) user.available=req.body.available===true||req.body.available==='true';
  if(req.body.pricing!==undefined) {
    const p=parseJson(req.body.pricing,null);
    if(!p||!Array.isArray(p.packages)||p.packages.length>20) return badRequest(res,'Invalid packages');
    if(p.packages.some(x=>!x.name||!Number.isFinite(Number(x.price))||Number(x.price)<0||Number(x.price)>10000000)) return badRequest(res,'Invalid package price');
    user.pricing={packages:p.packages.map(x=>({name:String(x.name).slice(0,100),duration:String(x.duration||'').slice(0,100),description:String(x.description||'').slice(0,500),price:Number(x.price)})),addOns:[]};
  }
  const removed=parseJson(req.body.galleryToDelete,[]);
  if(Array.isArray(removed)&&removed.length) user.gallery=user.gallery.filter(g=>!removed.includes(String(g._id)));
  for(const file of req.files||[]) {
    const image=await uploadImage(file);
    user.gallery.push({url:image.url,publicId:image.publicId,type:'image',title:file.originalname.slice(0,100)});
  }
  if(req.body.approvalStatus==='pending'&&['draft','rejected'].includes(user.approvalStatus)) {
    user.approvalStatus='pending';user.isApproved=false;
  }
  await user.save();res.json(displayArtist(user));
}));
artistsRouter.get('/:id',asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid artist ID');
  const user=await User.findOne({_id:req.params.id,role:'artist',approvalStatus:'approved',isApproved:true});
  if(!user) return res.status(404).json({message:'Artist not found'});
  res.json(displayArtist(user));
}));
artistsRouter.post('/:id/reviews',requireAuth,requireRole('customer'),asyncRoute(async(req,res)=>{
  const {rating,comment=''}=req.body;
  if(!validId(req.params.id)||!Number.isInteger(Number(rating))||Number(rating)<1||Number(rating)>5||typeof comment!=='string'||comment.length>1000) return badRequest(res,'Invalid review');
  const artist=await User.findOne({_id:req.params.id,role:'artist',isApproved:true});
  if(!artist) return res.status(404).json({message:'Artist not found'});
  const completed=await Booking.exists({customer:req.user._id,artist:artist._id,status:'completed',paymentStatus:'paid'});
  if(!completed) return res.status(403).json({message:'Review requires completed paid booking'});
  if(artist.reviews.some(r=>String(r.customer)===String(req.user._id))) return res.status(409).json({message:'Already reviewed'});
  artist.reviews.push({customer:req.user._id,name:req.user.name,rating:Number(rating),comment});
  await artist.save();res.status(201).json(displayArtist(artist));
}));
