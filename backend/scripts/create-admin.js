import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

if(!process.env.MONGODB_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length<12) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in backend/.env');
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const email=process.env.ADMIN_EMAIL.trim().toLowerCase();
  if(await User.exists({email})) throw Error('Admin email already registered');
  await User.create({name:process.env.ADMIN_NAME||'IndiFolks Admin',email,passwordHash:await bcrypt.hash(process.env.ADMIN_PASSWORD,12),role:'admin',isApproved:true,approvalStatus:'approved'});
  console.log('Admin created successfully. Remove ADMIN_PASSWORD from .env after setup.');
} catch(err){console.error(err.message);process.exitCode=1} finally {await mongoose.disconnect()}
