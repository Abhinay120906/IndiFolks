import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useArtistOptions } from "@/hooks/useArtistOptions";

type Props = {
  state: string;
  artForm: string;
  onStateChange: (value:string)=>void;
  onArtFormChange: (value:string)=>void;
  specialty?: string;
  onSpecialtyChange?: (value:string)=>void;
  required?: boolean;
};

const OTHER="__other__";
const selectStyle="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

export default function ArtistTaxonomyFields({
  state,artForm,onStateChange,onArtFormChange,specialty,onSpecialtyChange,required=false
}:Props) {
  const {options,loading,error,refresh}=useArtistOptions();
  const [forcedOtherState,setForcedOtherState]=useState(false);
  const [forcedOtherArt,setForcedOtherArt]=useState(false);
  const knownStates=options.states.includes(state);
  const knownArt=options.artForms.includes(artForm);
  const stateSelection=forcedOtherState||state&&!knownStates?OTHER:state||"";
  const artSelection=forcedOtherArt||artForm&&!knownArt?OTHER:artForm||"";
  return <div className="space-y-4">
    {error&&<div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      Couldn't load the latest options. <Button size="sm" variant="outline" type="button" onClick={refresh}>Retry</Button>
    </div>}
    <div className="space-y-2">
      <Label htmlFor="artist-state">State / Union Territory <span className="text-destructive">*</span></Label>
      <select id="artist-state" className={selectStyle} value={stateSelection} required={required}
        disabled={loading}
        onChange={e=>{setForcedOtherState(e.target.value===OTHER);onStateChange(e.target.value===OTHER?"":e.target.value);}}>
        <option value="">{loading?"Loading states…":"Choose state / union territory"}</option>
        {options.states.map(name=><option key={name} value={name}>{name}</option>)}
        <option value={OTHER}>Other — specify a location</option>
      </select>
      {stateSelection===OTHER&&<div className="space-y-1">
        <Input aria-label="Other state or location" value={state} required={required} maxLength={100}
          onChange={e=>onStateChange(e.target.value)} placeholder="Enter the state or region name" />
        <p className="text-xs text-muted-foreground">
          If you entered a city such as Vizag or Kolkata, select its state above so people can find you.
        </p>
      </div>}
      <p className="text-xs text-muted-foreground">Choosing the correct state puts you in the Explore States directory.</p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="artist-art-form">Primary art form <span className="text-destructive">*</span></Label>
      <select id="artist-art-form" className={selectStyle} value={artSelection} required={required}
        disabled={loading||!!error}
        onChange={e=>{setForcedOtherArt(e.target.value===OTHER);onArtFormChange(e.target.value===OTHER?"":e.target.value);}}>
        <option value="">{loading?"Loading art forms…":"Choose your tradition"}</option>
        {Object.entries(options.artFormGroups).map(([group,forms])=>
          <optgroup key={group} label={group}>
            <option value={group}>{group} (general)</option>
            {forms.map(name=><option value={name} key={name}>{name}</option>)}
          </optgroup>
        )}
        <option value={OTHER}>Other — my art form isn't listed</option>
      </select>
      {artSelection===OTHER&&<div className="space-y-1">
        <Input aria-label="Other art form" value={artForm} required={required} maxLength={100}
          onChange={e=>onArtFormChange(e.target.value)} placeholder="e.g. regional folk storytelling" />
        <p className="text-xs text-muted-foreground">Your custom art form will remain searchable and appear in discovery filters.</p>
      </div>}
    </div>
    {onSpecialtyChange && <div className="space-y-2">
      <Label htmlFor="artist-specialty">Additional specialty (optional)</Label>
      <Input id="artist-specialty" maxLength={100} value={specialty||""} onChange={e=>onSpecialtyChange(e.target.value)}
        placeholder="e.g. solo classical dance, live folk music" />
      <p className="text-xs text-muted-foreground">Helps customers find you by keyword; your primary art form controls the art-form filter.</p>
    </div>}
  </div>;
}
