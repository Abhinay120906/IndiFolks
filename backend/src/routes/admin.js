import { Router } from 'express';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncRoute, badRequest, validId } from '../lib/helpers.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));
adminRouter.get('/artists', asyncRoute(async (_req,res)=>res.json(await User.find({role:'artist'}).sort({createdAt:-1}).limit(500))));
adminRouter.get('/users', asyncRoute(async (_req,res)=>res.json(await User.find().sort({createdAt:-1}).limit(1000))));
adminRouter.get('/bookings', asyncRoute(async (_req,res)=>res.json(await Booking.find().populate('customer','name email profileImage').populate('artist','name email profileImage artForm specialty').sort({createdAt:-1}).limit(1000))));
async function approve(req,res,allowed) {
  if(!validId(req.params.id)) return badRequest(res,'Invalid artist');
  const artist=await User.findOne({_id:req.params.id,role:'artist'});
  if(!artist) return res.status(404).json({message:'Artist not found'});
  artist.approvalStatus=allowed?'approved':'rejected'; artist.isApproved=allowed;
  await artist.save(); res.json(artist);
}
adminRouter.patch('/artists/:id/approve',asyncRoute((req,res)=>approve(req,res,true)));
adminRouter.patch('/artists/:id/reject',asyncRoute((req,res)=>approve(req,res,false)));
adminRouter.delete('/users/:id',asyncRoute(async(req,res)=>{
  if(!validId(req.params.id)) return badRequest(res,'Invalid user');
  if(String(req.user._id)===req.params.id) return badRequest(res,'Cannot delete own admin account');
  const user=await User.findById(req.params.id);
  if(!user) return res.status(404).json({message:'User not found'});
  if(await Booking.exists({$or:[{customer:user._id},{artist:user._id}]})) return res.status(409).json({message:'Cannot delete accounts with booking history'});
  await user.deleteOne(); res.json({success:true});
}));
