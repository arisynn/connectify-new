import React from 'react';
import { Lock, Check } from 'lucide-react';
import { AVATARS, isAvatarUnlocked } from '../core/avatars';
import { useProfile } from '../core/profile/ProfileContext';
import { DynamicIcon } from './theme/DynamicIcon';

export const AvatarGallery=({selected,onSelect}:{selected:string,onSelect:(id:string)=>void})=>{
  const {profile}=useProfile();
  return <div className="avatar-gallery">{AVATARS.map(a=>{
    const unlocked=isAvatarUnlocked(profile,a),progress=Math.min(a.target,profile.statistics?.[a.stat]||0);
    return <button data-testid={`avatar-select-${a.id}`} key={a.id} disabled={!unlocked} aria-pressed={selected===a.id} onClick={()=>onSelect(a.id)} className={`avatar-card ${selected===a.id?'active':''} ${unlocked?'unlocked':'locked'}`}>
      <div className="avatar-portrait"><DynamicIcon name={a.id} className="w-full h-full"/>{!unlocked&&<span><Lock size={18}/></span>}{selected===a.id&&<span className="avatar-check"><Check size={18}/></span>}</div>
      <b data-testid={`avatar-name-${a.id}`}>{a.name}</b><p data-testid={`avatar-requirement-${a.id}`}>{a.requirement}</p><small data-testid={`avatar-progress-${a.id}`}>{unlocked?(selected===a.id?'Dipilih':'Terbuka'):`${progress} / ${a.target}`}</small>
      {!unlocked&&<div className="avatar-progress"><span style={{width:`${progress/a.target*100}%`}}/></div>}
    </button>;
  })}</div>;
};