import React,{useState} from 'react';
import {Check,Lock} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useTheme} from '../core/theme/ThemeProvider';
import {AVATARS,isAvatarUnlocked} from '../core/avatars';
import {AvatarGallery} from '../components/AvatarGallery';
import {CosmeticCollection} from '../components/CosmeticCollection';
import {ACHIEVEMENTS_DATA,getCurrentTier} from '../core/achievements';
import {ownsTheme,artRewardLabel} from '../core/artRewards';
import {COSMETICS,ownsCosmetic} from '../core/cosmetics';
import {artIcon} from '../core/artAssets';
export const CollectionScreen=()=>{
  const {profile,updateProfile}=useProfile(),{navigate}=useGame(),{availableThemes,activeTheme,setTheme}=useTheme();
  const [section,setSection]=useState('gaya');
  const themes=Object.values(availableThemes),cosmetics=COSMETICS.filter(c=>!c.hiddenIndividual),badges=ACHIEVEMENTS_DATA.map(a=>({...a,tier:getCurrentTier(profile,a.id)}));
  const total=AVATARS.length+themes.length+badges.length+cosmetics.length,owned=AVATARS.filter(a=>isAvatarUnlocked(profile,a)).length+themes.filter(t=>ownsTheme(profile,t.id)).length+badges.filter(b=>b.tier>0).length+cosmetics.filter(c=>ownsCosmetic(profile,c.id)).length;
  return <GameShell title="Lemari koleksi" eyebrow="SEMUA YANG MEMBUATNYA JADI MILIKMU" back="profile" wide><div data-testid="collection-screen" className="collection-body">
    <div className="club-page-banner"><div><span className="eyebrow" data-testid="collection-caption">KOLEKSI PRIBADIMU</span><h2 data-testid="collection-summary">{owned} / {total} terbuka</h2><p data-testid="collection-copy">Simpan gaya favorit. Pakai kapan saja.</p></div><img src={artIcon('collection')} alt=""/></div>
    <div className="club-filter-tabs" aria-label="Kategori koleksi">{[['gaya','Gaya & animasi'],['avatar','Avatar'],['tema','Tema'],['lencana','Lencana'],['item','Bantuan']].map(([id,label])=><button data-testid={`collection-tab-${id}`} key={id} aria-pressed={section===id} onClick={()=>setSection(id)}>{label}</button>)}</div>
    {section==='gaya'&&<CosmeticCollection/>}
    {section==='avatar'&&<AvatarGallery selected={profile.activeAvatarId||'avatar_male'} onSelect={id=>updateProfile({activeAvatarId:id,avatar:id,equippedCosmetics:{...profile.equippedCosmetics,avatar:null}})}/>}
    {section==='tema'&&<div className="atelier-grid">{themes.map(theme=>{const owned=ownsTheme(profile,theme.id),equipped=activeTheme.id===theme.id;return <article className="atelier-product" data-testid={`collection-theme-${theme.id}`} key={theme.id}><div className="product-art theme">{Object.values(theme.assets.tiles).slice(0,3).map((src,i)=><img data-testid={`collection-theme-image-${theme.id}-${i}`} src={src} key={src} alt=""/>)}</div><div className="product-copy"><h3 data-testid={`collection-theme-name-${theme.id}`}>{theme.name}</h3><p data-testid={`collection-theme-count-${theme.id}`}>{Object.keys(theme.assets.tiles).length} gambar pasangan</p>{equipped?<span className="product-action equipped" data-testid={`collection-equipped-${theme.id}`}><Check size={14}/>Dipakai</span>:owned?<button className="product-action" data-testid={`collection-equip-${theme.id}`} onClick={()=>{setTheme(theme.id);updateProfile({activeTheme:theme.id});}}>Pakai</button>:theme.reward?<p data-testid={`collection-requirement-${theme.id}`}>{artRewardLabel(theme.reward)}</p>:<button className="product-action" data-testid={`collection-buy-${theme.id}`} onClick={()=>navigate('toko')}>Lihat di toko</button>}</div></article>;})}</div>}
    {section==='lencana'&&<div className="collection-badge-grid">{badges.map(b=><article data-testid={`collection-badge-${b.id}`} key={b.id} className={`collection-badge ${b.tier?'earned':''}`}><div>{b.tier?<img src={artIcon('achievements')} alt=""/>:<Lock size={23}/>}</div><h3 data-testid={`collection-badge-name-${b.id}`}>{b.category==='secret'&&!b.tier?'Rahasia klub':b.title}</h3><span data-testid={`collection-badge-tier-${b.id}`}>Tier {b.tier} / {b.tiers.length}</span></article>)}</div>}
    {section==='item'&&<div className="inventory-grid">{[['hint','hints','Petunjuk'],['shuffle','shuffles','Acak'],['hammer','hammers','Palu'],['bomb','bombs','Bom']].map(([id,key,label])=><article key={id} data-testid={`collection-item-${id}`}><img src={artIcon(id)} alt=""/><div><h3>{label}</h3><b data-testid={`collection-count-${id}`}>{profile[key]??0} tersimpan</b></div></article>)}</div>}
  </div></GameShell>;
};