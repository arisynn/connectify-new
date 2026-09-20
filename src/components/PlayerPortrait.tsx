import React from 'react';
import {useProfile} from '../core/profile/ProfileContext';
import {equippedCosmetic} from '../core/cosmetics';
import {DynamicIcon} from './theme/DynamicIcon';
import {cosmeticImage} from '../core/artAssets';
export const PlayerPortrait=({id='player-portrait'}:{id?:string})=>{
  const {profile}=useProfile(),avatar=equippedCosmetic(profile,'avatar'),frame=equippedCosmetic(profile,'frame');
  return <div data-testid={id} className={`player-portrait ${frame?'bitmap-frame':''}`}>
    {avatar?<img data-testid={`${id}-image`} src={cosmeticImage(avatar)} alt={avatar.name}/>:<DynamicIcon name={profile.activeAvatarId||'avatar_male'} className="w-full h-full"/>}
    {frame&&<img data-testid={`${id}-frame`} className="frame-overlay" src={cosmeticImage(frame)} alt={frame.name}/>}
  </div>;
};