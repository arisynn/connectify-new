import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { getAccountProgress } from '../core/progression';
import { useProfile } from '../core/profile/ProfileContext';
import { useGame } from '../GameContext';

export const AccountProgress=({id='account-progress',compact=false}:{id?:string,compact?:boolean})=>{
  const {profile}=useProfile(),{navigate}=useGame(),p=getAccountProgress(profile);
  const content=<><span className="xp-badge" data-testid={`${id}-level`}>{p.level}</span><div className="xp-copy"><div><b data-testid={`${id}-rank`}>{p.title}</b><small data-testid={`${id}-xp`}>{p.current} / {p.needed} XP</small></div><div className="xp-track" role="progressbar" aria-label="Progres level akun" aria-valuenow={p.current} aria-valuemin={0} aria-valuemax={p.needed} data-testid={`${id}-bar`}><span style={{width:`${p.percent}%`}}/></div><small data-testid={`${id}-next`}>{compact?'Setiap ronde bikin kamu berkembang.':p.nextRank?`Gelar berikutnya: ${p.nextRank.title} · Lv. ${p.nextRank.level}`:'Gelar tertinggi klub. Terus cetak rekor!'}</small></div>{compact?<ChevronRight size={19}/>:<Sparkles size={20}/>}</>;
  return compact?<button data-testid={id} className="account-progress compact" onClick={()=>navigate('profile')}>{content}</button>:<section data-testid={id} className="account-progress">{content}</section>;
};