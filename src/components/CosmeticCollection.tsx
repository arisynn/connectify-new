import React,{useState} from 'react';
import {Check,Lock} from 'lucide-react';
import {useProfile} from '../core/profile/ProfileContext';
import {COSMETICS,ownsCosmetic,isCosmeticEquipped,cosmeticEquipPatch} from '../core/cosmetics';
import {artRewardLabel,artRewardProgress} from '../core/artRewards';
import {useGame} from '../GameContext';
import {CosmeticPreview} from './CosmeticPreview';
export const CosmeticCollection=()=>{
  const {profile,updateProfile}=useProfile(),{navigate}=useGame(),[rewards,setRewards]=useState(false);
  const items=COSMETICS.filter(item=>!item.hiddenIndividual&&(rewards?!!item.reward:ownsCosmetic(profile,item.id)));
  return <section data-testid="cosmetic-collection"><div className="theme-art-tabs">
    <button data-testid="cosmetics-tab-rewards" aria-pressed={rewards} onClick={()=>setRewards(true)}>Hadiah perjalanan</button>
    <button data-testid="cosmetics-tab-owned" aria-pressed={!rewards} onClick={()=>setRewards(false)}>Milikku</button>
  </div><div className="art-reward-grid">{items.map(item=>{
    const owned=ownsCosmetic(profile,item.id),equipped=isCosmeticEquipped(profile,item);
    return <article key={item.id} className="art-reward-card" data-testid={`cosmetic-collection-${item.id}`}><CosmeticPreview item={item} context="collection"/><div className="product-copy">
      <h3 data-testid={`cosmetic-name-${item.id}`}>{item.name}</h3>
      {item.reward&&<><p data-testid={`cosmetic-rule-${item.id}`}>{artRewardLabel(item.reward)}</p><progress data-testid={`cosmetic-progress-${item.id}`} aria-label={artRewardLabel(item.reward)} max={item.reward.target} value={Math.min(artRewardProgress(profile,item.reward),item.reward.target)}/><span className="art-reward-progress" data-testid={`cosmetic-progress-label-${item.id}`}>{Math.min(artRewardProgress(profile,item.reward),item.reward.target)} / {item.reward.target}</span></>}
      {owned?<>{equipped?<><span className="product-action equipped" data-testid={`cosmetic-equipped-${item.id}`}><Check size={14}/>Dipakai</span>{item.price!==0&&<button data-testid={`cosmetic-remove-${item.id}`} className="text-button remove-cosmetic" onClick={()=>updateProfile(cosmeticEquipPatch(profile,item,true))}>Lepas</button>}</>:<button data-testid={`cosmetic-equip-${item.id}`} className="product-action" onClick={()=>updateProfile(cosmeticEquipPatch(profile,item))}>{item.members?'Pakai seluruh set':'Pakai'}</button>}</>:<span className="theme-art-requirement" data-testid={`cosmetic-locked-${item.id}`}><Lock size={14}/>Belum terbuka</span>}
    </div></article>;
  })}</div>{!rewards&&<button className="pop-button mint mt-5" data-testid="cosmetic-open-store" onClick={()=>navigate('toko')}>Kunjungi toko</button>}</section>;
};