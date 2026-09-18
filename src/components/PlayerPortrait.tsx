import React from 'react';
import {useProfile} from '../core/profile/ProfileContext';
import {equippedCosmetic} from '../core/cosmetics';
import {DynamicIcon} from './theme/DynamicIcon';
export const PlayerPortrait=({id='player-portrait'}:{id?:string})=>{
  const {profile}=useProfile(),avatar=equippedCosmetic(profile,'avatar'),frame=equippedCosmetic(profile,'frame');
  return <div data-testid={id} className={`player-portrait frame-${frame?.asset||'default'}`}>
    {avatar?<img data-testid={`${id}-image`} src={`/art/atelier/${avatar.asset}.svg`} alt={avatar.name}/>:<DynamicIcon name={profile.activeAvatarId||'avatar_male'} className="w-full h-full"/>}
  </div>;
};