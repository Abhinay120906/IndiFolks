import { useEffect, useState } from "react";

export type ArtistOptions = {
  states: string[];
  artForms: string[];
  categories: string[];
  artFormGroups: Record<string,string[]>;
  customStates: string[];
  customArtForms: string[];
};

const empty: ArtistOptions = {states:[],artForms:[],categories:[],artFormGroups:{},customStates:[],customArtForms:[]};

export function useArtistOptions() {
  const [options,setOptions] = useState<ArtistOptions>(empty);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [version,setVersion] = useState(0);
  useEffect(()=>{
    let cancelled=false;
    const load=async()=>{
      setLoading(true);
      setError("");
      try {
        const response=await fetch(`${import.meta.env.VITE_API_URL}/api/artists/options`);
        if(!response.ok) throw Error("Unable to load state and art-form options");
        const data=await response.json();
        if(!Array.isArray(data.states)||!Array.isArray(data.artForms)||!data.artFormGroups)
          throw Error("Unexpected options response");
        if(!cancelled)setOptions(data);
      } catch(e) {
        if(!cancelled)setError(e instanceof Error?e.message:"Options unavailable");
      } finally {
        if(!cancelled)setLoading(false);
      }
    };
    void load();
    return ()=>{cancelled=true;};
  },[version]);
  return {options,loading,error,refresh:()=>setVersion(v=>v+1)};
}
