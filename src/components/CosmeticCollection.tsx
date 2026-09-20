import React,{useState} from 'react';
import {Check,Lock} from 'lucide-react';
import {useProfile} from '../core/profile/ProfileContext';
import {COSMETICS,ownsCosmetic,equippedCosmetic} from '../core/cosmetics';
import {artRewardLabel,artRewardProgress} from '../core/artRewards';
import {useGame} from '../GameContext';
import {CosmeticPreview} from './CosmeticPreview';
export const CosmeticCollection=()=>{
  const {profile,updateProfile}=useProfile(),{navigate}=useGame(),[rewards,setRewards]=useState(true);
  const items=COSMETICS.filter(item=>rewards?!!item.reward:ownsCosmetic(profile,item.id));
  return <section data-testid="cosmetic-collection"><div className="theme-art-tabs">
    <button data-testid="cosmetics-tab-rewards" aria-pressed={rewards} onClick={()=>setRewards(true)}>Hadiah perjalanan</button>
    <button data-testid="cosmetics-tab-owned" aria-pressed={!rewards} onClick={()=>setRewards(false)}>Milikku</button>
  </div><div className="art-reward-grid">{items.map(item=>{
    const owned=ownsCosmetic(profile,item.id),equipped=equippedCosmetic(profile,item.slot)?.id===item.id;
    return <article key={item.id} className="art-reward-card" data-testid={`cosmetic-collection-${item.id}`}><CosmeticPreview item={item} context="collection"/><div className="product-copy">
      <h3 data-testid={`cosmetic-name-${item.id}`}>{item.name}</h3>
      {item.reward&&<><p data-testid={`cosmetic-rule-${item.id}`}>{artRewardLabel(item.reward)}</p><progress data-testid={`cosmetic-progress-${item.id}`} aria-label={artRewardLabel(item.reward)} max={item.reward.target} value={Math.min(artRewardProgress(profile,item.reward),item.reward.target)}/><span className="art-reward-progress" data-testid={`cosmetic-progress-label-${item.id}`}>{Math.min(artRewardProgress(profile,item.reward),item.reward.target)} / {item.reward.target}</span></>}
      {owned?<button data-testid={`cosmetic-equip-${item.id}`} disabled={equipped&&item.price===0} className={`product-action ${equipped?'equipped':''}`} onClick={()=>updateProfile({equippedCosmetics:{...profile.equippedCosmetics,[item.slot]:equipped?null:item.id}})}>{equipped?<><Check size={14}/>{item.price===0?'Dipakai':'Dipakai · Lepas'}</>:'Pakai'}</button>:<span className="theme-art-requirement" data-testid={`cosmetic-locked-${item.id}`}><Lock size={14}/>Belum terbuka</span>}
    </div></article>;
  })}</div>{!rewards&&<button className="pop-button mint mt-5" data-testid="cosmetic-open-store" onClick={()=>navigate('toko')}>Kunjungi toko</button>}</section>;
};