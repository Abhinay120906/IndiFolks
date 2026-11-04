import { Router } from 'express';
import { User } from '../models/User.js';
import { asyncRoute } from '../lib/helpers.js';
export const statesRouter = Router();

const records = [
['Andhra Pradesh','South','Kuchipudi|Burrakatha'],['Arunachal Pradesh','Northeast','Aji Lhamu'],
['Assam','Northeast','Bihu|Sattriya'],['Bihar','East','Madhubani|Jat-Jatin'],
['Chhattisgarh','Central','Panthi|Raut Nacha'],['Goa','West','Fugdi|Dhalo'],
['Gujarat','West','Garba|Dandiya'],['Haryana','North','Saang'],
['Himachal Pradesh','North','Nati'],['Jharkhand','East','Chhau|Paika'],
['Karnataka','South','Yakshagana|Dollu Kunitha'],['Kerala','South','Kathakali|Mohiniyattam'],
['Madhya Pradesh','Central','Matki|Rai'],['Maharashtra','West','Lavani|Powada'],
['Manipur','Northeast','Manipuri|Pung Cholom'],['Meghalaya','Northeast','Shad Suk Mynsiem'],
['Mizoram','Northeast','Cheraw'],['Nagaland','Northeast','Naga Folk Dance'],
['Odisha','East','Odissi|Pattachitra'],['Punjab','North','Bhangra|Giddha'],
['Rajasthan','West','Ghoomar|Kalbelia'],['Sikkim','Northeast','Maruni'],
['Tamil Nadu','South','Bharatanatyam|Karagattam'],['Telangana','South','Perini|Oggu Katha'],
['Tripura','Northeast','Hojagiri'],['Uttar Pradesh','North','Kathak|Nautanki'],
['Uttarakhand','North','Chholiya'],['West Bengal','East','Baul|Chhau'],
['Andaman and Nicobar Islands','Islands','Nicobari Folk Dance'],
['Chandigarh','North','Bhangra'],['Dadra and Nagar Haveli and Daman and Diu','West','Tarpa Dance'],
['Delhi','North','Kathak'],['Jammu and Kashmir','North','Rouf'],
['Ladakh','North','Cham'],['Lakshadweep','Islands','Lava Dance'],
['Puducherry','South','Garadi']
];
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const states = records.map(([name,region,forms])=>({
 id:slug(name),name,region,icon:'🎭',
 artForms:forms.split('|'),description:'Explore the living folk and classical art traditions of '+name+'.',
 culturalHighlights:[],featuredArtists:[]
}));
statesRouter.get('/',asyncRoute(async(_req,res)=>{
 const counts=await User.aggregate([{$match:{role:'artist',isApproved:true,approvalStatus:'approved'}},{$group:{_id:'$state',count:{$sum:1}}}]);
 const byState=new Map(counts.map(x=>[x._id,x.count]));
 res.json(states.map(s=>({...s,artistCount:byState.get(s.name)||0})));
}));
statesRouter.get('/:id',asyncRoute(async(req,res)=>{
 const s=states.find(x=>x.id===req.params.id);
 if(!s) return res.status(404).json({message:'State not found'});
 const artists=await User.find({role:'artist',state:s.name,isApproved:true,approvalStatus:'approved'}).select('name profileImage artForm specialty state price').limit(10).lean();
 res.json({...s,featuredArtists:artists});
}));
