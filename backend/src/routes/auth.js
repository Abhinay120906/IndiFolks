import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { asyncRoute, badRequest } from '../lib/helpers.js';
import { imageUpload, uploadImage, deleteImage } from '../lib/upload.js';
import { requireAuth, authResponse } from '../middleware/auth.js';
import { normalizeState, isValidCustomValue } from '../lib/artistCatalog.js';

export const authRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

authRouter.post('/register', imageUpload.single('profileImage'), asyncRoute(async (req, res) => {
  const { name, email, password, role = 'customer', bio, state, artForm, specialty, awards } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || !emailPattern.test(email || '') || typeof password !== 'string' || password.length < 8 || password.length > 128) return badRequest(res, 'Provide name, valid email and password (8-128 chars)');
  if (!['customer', 'artist'].includes(role)) return badRequest(res, 'Only customer and artist self-registration is allowed');
  const resolvedState = role==='artist'?normalizeState(state):'';
  const resolvedArt = role==='artist'?String(artForm||specialty||'').trim():'';
  if(role==='artist'&&(!isValidCustomValue(resolvedState)||!isValidCustomValue(resolvedArt))) {
    return badRequest(res,'Please choose a state and art form, or provide the missing tradition under Other');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email already registered' });
  const uploaded = await uploadImage(req.file);
  const user = await User.create({
    name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role,
    profileImage: uploaded?.url || '', profileImagePublicId: uploaded?.publicId,
    bio: role === 'artist' ? String(bio || '').slice(0,3000) : '',
    state: resolvedState.slice(0,100),
    specialty: role === 'artist' ? String(specialty || resolvedArt).trim().slice(0,100) : '',
    artForm: resolvedArt.slice(0,100),
    awards: role === 'artist' ? String(awards || '').slice(0,500) : '',
    approvalStatus: role === 'artist' ? 'pending' : 'approved', isApproved: role !== 'artist'
  });
  // Aadhaar information, if sent by an old frontend, is deliberately ignored.
  if (role === 'artist') return res.status(201).json({ pendingApproval: true, message: 'Registration received; please wait for admin approval' });
  res.status(201).json(authResponse(user));
}));

authRouter.post(['/login','/admin-login'], asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') return badRequest(res, 'Email and password are required');
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Incorrect email or password' });
  if (req.path === '/admin-login' && user.role !== 'admin') return res.status(403).json({ message: 'Admin account required' });
  if (user.role === 'artist' && user.approvalStatus !== 'approved') return res.status(403).json({ message: 'Artist account awaiting approval or rejected' });
  res.json(authResponse(user));
}));

authRouter.get('/me', requireAuth, (req,res) => res.json(req.user));
authRouter.put('/profile', requireAuth, imageUpload.single('profileImage'), asyncRoute(async(req,res)=>{
  if(req.body.name !== undefined) {
    if(typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 100) return badRequest(res,'Invalid name');
    req.user.name=req.body.name.trim();
  }
  if(req.body.bio !== undefined) req.user.bio=String(req.body.bio).slice(0,3000);
  if(req.user.role==='artist') {
    if(req.body.state!==undefined) {
      const state=normalizeState(req.body.state);
      if(!isValidCustomValue(state)) return badRequest(res,'Please provide a valid state');
      req.user.state=state.slice(0,100);
    }
    if(req.body.artForm!==undefined||req.body.specialty!==undefined) {
      const art=String(req.body.artForm||req.body.specialty||'').trim();
      if(!isValidCustomValue(art)) return badRequest(res,'Please choose or specify your art form');
      req.user.artForm=art.slice(0,100);
      if(req.body.specialty!==undefined) req.user.specialty=String(req.body.specialty||art).trim().slice(0,100);
    }
  }
  const oldProfileImageId=req.user.profileImagePublicId;
  let uploaded;
  try {
    if(req.file) {
      uploaded=await uploadImage(req.file);
      req.user.profileImage=uploaded.url; req.user.profileImagePublicId=uploaded.publicId;
    }
    await req.user.save();
  } catch(err) {
    if(uploaded?.publicId) await deleteImage(uploaded.publicId).catch(()=>{});
    throw err;
  }
  if(uploaded&&oldProfileImageId&&oldProfileImageId!==uploaded.publicId) {
    await deleteImage(oldProfileImageId).catch(err=>console.error('Previous avatar cleanup failed:',err.message));
  }
  res.json(req.user);
}));
