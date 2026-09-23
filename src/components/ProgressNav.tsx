import React from 'react';
import {Trophy,BarChart2} from 'lucide-react';
import {useGame,Screen} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {getClaimableAchievements,HUB_GAME} from '../core/achievements';
export const ProgressNav=()=>{
  const {screen,navigate}=useGame(),{profile}=useProfile(),ready=getClaimableAchievements(profile).filter((a:any)=>(a.game||HUB_GAME)===HUB_GAME).length;
  return <nav className="progress-nav" data-testid="progress-navigation" aria-label="Progres klub">{[{id:'prestasi',label:'Pencapaian',icon:Trophy},{id:'statistik',label:'Statistik',icon:BarChart2}].map(t=><button data-testid={`progress-nav-${t.id}`} key={t.id} aria-current={screen===t.id?'page':undefined} className={screen===t.id?'active':''} onClick={()=>navigate(t.id as Screen)}><t.icon size={17}/><span>{t.label}</span>{t.id==='prestasi'&&ready>0&&<b data-testid="progress-achievement-count">{ready}</b>}</button>)}</nav>;
};