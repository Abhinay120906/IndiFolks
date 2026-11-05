import { Router } from 'express';
import { User } from '../models/User.js';
import { asyncRoute } from '../lib/helpers.js';
import { STATE_RECORDS, normalizeState, categoryForArt } from '../lib/artistCatalog.js';

export const statesRouter = Router();
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const states = STATE_RECORDS.map(([name,region,forms])=>({
 id:slug(name),name,region,icon:'🎭',
 artForms:forms.split('|'),
 description:'Explore the living folk and classical art traditions of '+name+'.'
}));
const approved={role:'artist',isApproved:true,approvalStatus:'approved'};

statesRouter.get('/',asyncRoute(async(_req,res)=>{
  const artists=await User.find(approved).select('state').limit(3000).lean();
  const counts=new Map();
  for(const artist of artists) {
    const state=normalizeState(artist.state);
    counts.set(state,(counts.get(state)||0)+1);
  }
  res.json(states.map(state=>({
    ...state,artForms:state.artForms.length,
    artists:counts.get(state.name)||0,artistCount:counts.get(state.name)||0
  })));
}));

statesRouter.get('/:id',asyncRoute(async(req,res)=>{
  const state=states.find(record=>record.id===req.params.id);
  if(!state) return res.status(404).json({message:'State not found'});
  const approvedArtists=await User.find(approved)
    .select('name profileImage gallery available reviews artForm specialty state price experience')
    .limit(3000).lean();
  const matches=approvedArtists.filter(artist=>normalizeState(artist.state)===state.name);
  const featuredArtists=matches.slice(0,10).map(artist=>{
    const reviews=artist.reviews||[];
    const rating=reviews.length?reviews.reduce((sum,r)=>sum+(r.rating||0),0)/reviews.length:0;
    return {
      _id:artist._id,name:artist.name,profileImage:artist.profileImage,
      gallery:artist.gallery?.map(g=>({url:g.url,title:g.title}))||[],
      state:state.name,artForm:artist.artForm||artist.specialty||'',
      specialty:artist.specialty||'',price:artist.price||0,available:artist.available,
      rating:Math.round(rating*10)/10,reviewsCount:reviews.length
    };
  });
  const artForms=state.artForms.map(name=>({
    id:slug(name),name,category:categoryForArt(name),
    type:'Traditional art',
    description:'Discover '+name+' performers and cultural artists.'
  }));
  res.json({...state,artForms,culturalHighlights:state.artForms.map(name=>name+' traditions'),
    artistCount:matches.length,featuredArtists});
}));
