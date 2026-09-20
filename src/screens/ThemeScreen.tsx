import React, {useState} from 'react';
import {Check, Lock} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useTheme} from '../core/theme/ThemeProvider';
import {ownsTheme,artRewardLabel,artRewardProgress} from '../core/artRewards';
export const ThemeScreen=()=>{
  const {navigate}=useGame(),{profile,updateProfile}=useProfile(),{availableThemes,activeTheme,setTheme}=useTheme();
  const [rewards,setRewards]=useState(false);
  return <GameShell title="Tema permainan" eyebrow="WARNA UNTUK JEDAMU" wide>
    <div className="theme-art-tabs">{[[false,'Koleksi tema'],[true,'Edisi hadiah']].map(([value,label])=><button key={String(value)} data-testid={`themes-tab-${value?'rewards':'collection'}`} aria-pressed={rewards===value} onClick={()=>setRewards(Boolean(value))}>{label}</button>)}</div>
    <div className="theme-art-grid" data-testid="theme-products">{Object.values(availableThemes).filter(theme=>(theme.type==='reward')===rewards).map(theme=>{
      const owned=ownsTheme(profile,theme.id),equipped=activeTheme.id===theme.id;
      return <article className="atelier-product" key={theme.id} data-testid={`theme-card-${theme.id}`}>
        <div className="product-art theme">{Object.values(theme.assets.tiles).slice(0,3).map((src,i)=><img key={src} data-testid={`theme-sample-${theme.id}-${i}`} src={src} alt={`${theme.name}, gambar ${i+1}`}/>)}</div>
        <div className="product-copy"><span className="product-kind" data-testid={`theme-count-${theme.id}`}>{Object.keys(theme.assets.tiles).length} GAMBAR</span><h3 data-testid={`theme-name-${theme.id}`}>{theme.name}</h3>
          {theme.reward&&<p data-testid={`theme-requirement-${theme.id}`}>{artRewardLabel(theme.reward)} · {Math.min(artRewardProgress(profile,theme.reward),theme.reward.target)}/{theme.reward.target}</p>}
          {owned?<button data-testid={`theme-equip-${theme.id}`} className={`product-action ${equipped?'equipped':''}`} disabled={equipped} onClick={()=>{setTheme(theme.id);updateProfile({activeTheme:theme.id});}}>{equipped?<><Check size={14}/>Dipakai</>:'Pakai'}</button>:theme.reward?<span className="theme-art-requirement" data-testid={`theme-locked-${theme.id}`}><Lock size={14}/>Belum terbuka</span>:<button className="product-action" data-testid={`theme-shop-${theme.id}`} onClick={()=>navigate('toko')}>{theme.price} Permen · Toko</button>}
        </div>
      </article>;
    })}</div>
  </GameShell>;
};