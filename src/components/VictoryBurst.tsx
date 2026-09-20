import React from 'react';
import {useProfile} from '../core/profile/ProfileContext';
import {equippedCosmetic} from '../core/cosmetics';
import {cosmeticImage} from '../core/artAssets';
export const VictoryBurst=()=>{
  const {profile}=useProfile(),effect=equippedCosmetic(profile,'effect');
  return <div className="victory-burst bitmap-burst" data-testid="victory-effect" data-effect={effect?.id||'default'} aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{left:`${3+(i*23)%91}%`,animationDelay:`${(i%6)*.09}s`,backgroundImage:`url(${cosmeticImage(effect)})`}}/>)}</div>;
};