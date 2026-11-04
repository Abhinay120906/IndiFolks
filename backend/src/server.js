import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth.js';
import { artistsRouter } from './routes/artists.js';
import { bookingsRouter } from './routes/bookings.js';
import { adminRouter } from './routes/admin.js';
import { statesRouter } from './routes/states.js';
import { paymentsRouter } from './routes/payments.js';
import { User } from './models/User.js';

const app=express();
app.disable('x-powered-by');
app.set('trust proxy',1);
app.use(helmet());
const origins=(process.env.CLIENT_ORIGINS||'http://localhost:8080,http://localhost:5173').split(',').map(x=>x.trim().replace(/\/$/,'')).filter(Boolean);
app.use(cors({origin(origin,cb){cb(null,!origin||origins.includes(origin));}}));
app.use(express.json({limit:'100kb'}));
app.use(rateLimit({windowMs:15*60*1000,limit:150,standardHeaders:'draft-7',legacyHeaders:false}));
app.get('/api/health',(_req,res)=>res.json({ok:true,db:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.use('/api/auth',authRouter);
app.use('/api/artists',artistsRouter);
app.use('/api/bookings',bookingsRouter);
app.use('/api/admin',adminRouter);
app.use('/api/states',statesRouter);
app.use('/api/payments',paymentsRouter);
app.get('/api/stats',async(req,res,next)=>{
 try {
  const totalArtists=await User.countDocuments({role:'artist',isApproved:true,approvalStatus:'approved'});
  res.json({success:true,data:{totalArtists}});
 }catch(err){next(err)}
});
app.use((_req,res)=>res.status(404).json({message:'API endpoint not found'}));
app.use((err,_req,res,_next)=>{
 const status=err.status||(err.code===11000?409:['ValidationError','CastError','MulterError'].includes(err.name)?400:500);
 if(status>=500) console.error(err);
 res.status(status).json({message:status===500?'Unexpected server error':err.code===11000?'Duplicate entry':err.message});
});
const port=Number(process.env.PORT||5000);
if(!process.env.MONGODB_URI||!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32) {
 console.error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters');process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:15000})
 .then(()=>app.listen(port,'0.0.0.0',()=>console.log('IndiFolks API listening on '+port)))
 .catch(err=>{console.error('Database connection failed:',err.message);process.exit(1)});
