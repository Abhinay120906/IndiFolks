import { Router } from 'express';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { imageUpload, uploadImage, deleteImage, imageStorageConfigured } from '../lib/upload.js';
import { profileCompleteness } from '../lib/profileCompleteness.js';
import { asyncRoute, badRequest, validId, parseJson, safeNumber } from '../lib/helpers.js';
import { indiaDayKey,monthRange } from '../lib/bookingDates.js';
import { ART_FORM_GROUPS, ART_FORMS, ART_CATEGORIES, STATE_NAMES, normalizeState, categoryForArt, artMatches, normalizeText, isValidCustomValue } from '../lib/artistCatalog.js';

export const artistsRouter = Router();
function displayArtist(user) {
  const source = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const u = { ...source, state: normalizeState(source.state), artForm: source.artForm || source.specialty || '' };
  delete u.passwordHash;
  delete u.email;
  delete u.profileImagePublicId;
  u.gallery = (u.gallery || []).map(({ publicId, ...image }) => image);
  const reviews = (u.reviews || []).map(({ customer, ...review }) => review);
  const rating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  return { ...u, reviews, rating: Math.round(rating * 10) / 10,
    reviewsCount: reviews.length, totalReviews: reviews.length,
    completeness: profileCompleteness(u), artCategory: categoryForArt(u.artForm),
    adminFee: 0, totalPrice: u.price || 0 };
}
artistsRouter.get('/options',asyncRoute(async(_req,res)=>{
  const artists=await User.find({role:'artist',approvalStatus:'approved',isApproved:true})
    .select('state artForm specialty').limit(3000).lean();
  const knownStates=new Set(STATE_NAMES.map(normalizeText));
  const knownForms=new Set(ART_FORMS.map(normalizeText));
  const customStates=[...new Set(artists.map(a=>normalizeState(a.state))
    .filter(name=>name&&name.length<=100&&!knownStates.has(normalizeText(name))))].sort();
  const customArtForms=[...new Set(artists.map(a=>a.artForm||a.specialty)
    .filter(name=>typeof name==='string'&&name.trim().length>=2&&name.length<=100&&!knownForms.has(normalizeText(name)))
    .map(name=>name.trim()))].sort();
  res.setHeader('Cache-Control','public, max-age=60');
  res.json({states:STATE_NAMES,artForms:ART_FORMS,categories:ART_CATEGORIES,artFormGroups:ART_FORM_GROUPS,customStates,customArtForms});
}));

artistsRouter.get('/',asyncRoute(async(req,res)=>{
  const artists=await User.find({role:'artist',approvalStatus:'approved',isApproved:true}).limit(3000).lean();
  const stateFilter=normalizeState(req.query.state||'');
  const formFilter=typeof req.query.artForm==='string'?req.query.artForm:'';
  const search=normalizeText(req.query.search||'').slice(0,80);
  const matching=artists.filter(artist=>{
    const location=normalizeState(artist.state);
    const artForm=artist.artForm||artist.specialty||'';
    if(stateFilter&&stateFilter!=='All States'&&normalizeText(location)!==normalizeText(stateFilter))return false;
    const broadFilter=formFilter==='Other'||ART_CATEGORIES.some(category=>normalizeText(category)===normalizeText(formFilter));
    if(formFilter&&formFilter!=='All Art Forms'&&!artMatches(artForm,formFilter)&&
       (broadFilter||!artMatches(artist.specialty||'',formFilter)))return false;
    if(search&&![artist.name,artist.specialty,artForm,categoryForArt(artForm),location,artist.bio]
      .some(value=>normalizeText(value).includes(search)))return false;
    return true;
  }).map(displayArtist);
  const sort=req.query.sort;
  if(sort==='reviews') matching.sort((a,b)=>b.totalReviews-a.totalReviews);
  else if(sort==='price-low') matching.sort((a,b)=>a.price-b.price);
  else if(sort==='price-high') matching.sort((a,b)=>b.price-a.price);
  else matching.sort((a,b)=>b.rating-a.rating);
  const limit=Math.min(100,Math.max(1,Number(req.query.limit)||100));
  res.json(matching.slice(0,limit));
}));
artistsRouter.get('/me',requireAuth,requireRole('artist'),(req,res)=>
  res.json({ ...displayArtist(req.user), imageUploadsEnabled:imageStorageConfigured() }));

artistsRouter.put('/profile',requireAuth,requireRole('artist'),
  imageUpload.fields([{name:'profileImage',maxCount:1},{name:'images',maxCount:8}]),
  asyncRoute(async(req,res)=>{
  const user=req.user;
  for(const key of ['name','bio','specialty','experience','story','awards']) {
    if(req.body[key]!==undefined) {
      if(typeof req.body[key]!=='string') return badRequest(res,'Invalid '+key);
      if(key==='name'&&!req.body[key].trim()) return badRequest(res,'Artist name is required');
      const max=key==='story'?5000:key==='bio'?3000:key==='name'?100:500;
      user[key]=req.body[key].trim().slice(0,max);
    }
  }
  if(req.body.state!==undefined){
    const state=normalizeState(req.body.state);
    if(!isValidCustomValue(state))return badRequest(res,'Choose a state or specify it under Other');
    user.state=state;
  }
  if(req.body.artForm!==undefined){
    const form=String(req.body.artForm||'').trim();
    if(!isValidCustomValue(form))return badRequest(res,'Choose an art form or specify it under Other');
    user.artForm=form;
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
  if(!Array.isArray(removed)||removed.length>24||removed.some(id=>typeof id!=='string')) return badRequest(res,'Invalid gallery removal');
  const removedImages=user.gallery.filter(g=>removed.includes(String(g._id)));
  const galleryFiles=req.files?.images||[];
  const avatarFile=req.files?.profileImage?.[0];
  if(removedImages.some(img=>img.publicId)&&!imageStorageConfigured()) {
    return res.status(503).json({message:'Cloudinary must be configured before removing previously uploaded gallery images'});
  }
  if(user.gallery.length-removedImages.length+galleryFiles.length>24) return badRequest(res,'Maximum 24 gallery images allowed');
  if((galleryFiles.length||avatarFile)&&!imageStorageConfigured()) {
    return res.status(503).json({message:'Cloudinary storage is not configured. Add Cloudinary credentials to the backend to upload images.'});
  }
  const newlyUploaded=[];
  const previousAvatar=user.profileImagePublicId;
  try {
    if(avatarFile){
      const img=await uploadImage(avatarFile);
      newlyUploaded.push(img.publicId);
      user.profileImage=img.url;
      user.profileImagePublicId=img.publicId;
    }
    const uploadedGallery=[];
    for(const file of galleryFiles) {
      const img=await uploadImage(file);
      newlyUploaded.push(img.publicId);
      uploadedGallery.push({url:img.url,publicId:img.publicId,type:'image',title:file.originalname.slice(0,100)});
    }
    user.gallery=user.gallery.filter(g=>!removed.includes(String(g._id)));
    user.gallery.push(...uploadedGallery);
    if(req.body.approvalStatus==='pending'&&['draft','rejected'].includes(user.approvalStatus)) {
      user.approvalStatus='pending';user.isApproved=false;
    }
    await user.save();
  } catch(err) {
    // Failed writes must not leak newly uploaded files into cloud storage.
    await Promise.allSettled(newlyUploaded.map(deleteImage));
    throw err;
  }
  // Delete obsolete media only AFTER the database has saved the new references.
  const staleIds=removedImages.map(g=>g.publicId).filter(Boolean);
  if(avatarFile&&previousAvatar&&previousAvatar!==user.profileImagePublicId) staleIds.push(previousAvatar);
  const deleted=await Promise.allSettled(staleIds.map(deleteImage));
  for(const result of deleted) if(result.status==='rejected') console.error('Image cleanup failed:',result.reason?.message);
  res.json({ ...displayArtist(user), imageUploadsEnabled:imageStorageConfigured() });
}));
// Return only the authenticated customer's own review; public artist responses
// intentionally omit customer IDs to protect reviewers' privacy.
artistsRouter.get('/:id/my-review',requireAuth,requireRole('customer','artist'),asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid artist ID');
  if(String(req.params.id)===String(req.user._id)) return res.status(403).json({message:'You cannot review your own artist profile'});
  const artist=await User.findOne({_id:req.params.id,role:'artist',isApproved:true}).select('reviews');
  if(!artist) return res.status(404).json({message:'Artist not found'});
  const review=artist.reviews.find(r=>String(r.customer)===String(req.user._id));
  res.json({review:review?{rating:review.rating,comment:review.comment,createdAt:review.createdAt}:null});
}));
// Allow customers to edit their own review, never another customer's review.
// Keep the original review ID and creation date; rating aggregates are
// recomputed by displayArtist after saving the same embedded document.
artistsRouter.patch('/:id/my-review',requireAuth,requireRole('customer','artist'),asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid artist ID');
  if(String(req.params.id)===String(req.user._id)) return res.status(403).json({message:'You cannot review your own artist profile'});
  const {rating,comment}=req.body||{};
  if(typeof rating!=='number'||!Number.isInteger(rating)||rating<1||rating>5||
     typeof comment!=='string'||!comment.trim()||comment.length>1000) {
    return badRequest(res,'Provide a rating between 1 and 5 and a comment of at most 1000 characters');
  }
  const artist=await User.findOne({_id:req.params.id,role:'artist',approvalStatus:'approved',isApproved:true});
  if(!artist) return res.status(404).json({message:'Artist not found'});
  const review=artist.reviews.find(r=>String(r.customer)===String(req.user._id));
  if(!review) return res.status(404).json({message:'You have not reviewed this artist'});
  review.rating=rating;
  review.comment=comment.trim();
  await artist.save();
  return res.json({review:{rating:review.rating,comment:review.comment,createdAt:review.createdAt,updatedAt:review.updatedAt},artist:displayArtist(artist)});
}));
// Public booked-day calendar. Exposes dates only, never customers or venues.
artistsRouter.get('/:id/availability',asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid artist ID');
  const month=typeof req.query.month==='string'?req.query.month:'';
  const range=monthRange(month);
  if(!range) return badRequest(res,'Provide month in YYYY-MM format');
  const artist=await User.exists({_id:req.params.id,role:'artist',approvalStatus:'approved',isApproved:true});
  if(!artist) return res.status(404).json({message:'Artist not found'});
  const bookings=await Booking.find({
    artist:req.params.id,date:{$gte:range.start,$lt:range.end},
    status:{$in:['confirmed','completed']}
  }).select('date').lean();
  res.setHeader('Cache-Control','no-store');
  res.json({month,bookedDates:[...new Set(bookings.map(b=>indiaDayKey(b.date)).filter(Boolean))].sort()});
}));
artistsRouter.get('/:id',asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid artist ID');
  const user=await User.findOne({_id:req.params.id,role:'artist',approvalStatus:'approved',isApproved:true});
  if(!user) return res.status(404).json({message:'Artist not found'});
  res.json(displayArtist(user));
}));
artistsRouter.post('/:id/reviews',requireAuth,requireRole('customer','artist'),asyncRoute(async(req,res)=>{
  const {rating,comment=''}=req.body;
  if(String(req.params.id)===String(req.user._id)) return res.status(403).json({message:'You cannot review your own artist profile'});
  if(!validId(req.params.id)||!Number.isInteger(Number(rating))||Number(rating)<1||Number(rating)>5||typeof comment!=='string'||comment.length>1000) return badRequest(res,'Invalid review');
  const artist=await User.findOne({_id:req.params.id,role:'artist',isApproved:true});
  if(!artist) return res.status(404).json({message:'Artist not found'});
  const acceptedPayments=process.env.ENABLE_DEMO_PAYMENTS==='true'?['paid','demo_paid']:['paid'];
  const completed=await Booking.exists({customer:req.user._id,artist:artist._id,status:'completed',paymentStatus:{$in:acceptedPayments}});
  if(!completed) return res.status(403).json({message:'Review requires completed paid booking'});
  if(artist.reviews.some(r=>String(r.customer)===String(req.user._id))) return res.status(409).json({message:'Already reviewed'});
  artist.reviews.push({customer:req.user._id,name:req.user.name,rating:Number(rating),comment});
  await artist.save();res.status(201).json(displayArtist(artist));
}));
