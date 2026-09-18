import React from 'react';
import {useProfile} from '../core/profile/ProfileContext';
import {equippedCosmetic} from '../core/cosmetics';
export const VictoryBurst=()=>{
  const {profile}=useProfile(),effect=equippedCosmetic(profile,'effect');
  return <div className={`victory-burst effect-${effect?.asset||'default'}`} data-testid="victory-effect" data-effect={effect?.asset||'default'} aria-hidden="true">{Array.from({length:effect?24:10},(_,i)=><i key={i} style={{left:`${3+(i*23)%91}%`,animationDelay:`${(i%6)*.09}s`,background:['#ed9db7','#e9c975','#77bca8','#91b5df'][i%4]}}/>)}</div>;
};