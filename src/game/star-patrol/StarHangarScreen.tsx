import React from 'react';
import {Play,ShoppingBag} from 'lucide-react';
import {GameShell} from '../../components/GameShell';
import {useGame} from '../../GameContext';
import {useProfile} from '../../core/profile/ProfileContext';
import {equippedCosmetic} from '../../core/cosmetics';
import {STAR_UPGRADES,starUpgradeLevel} from '../../core/starPatrol';
import './star-patrol.css';
export const StarHangarScreen=()=>{
  const {profile}=useProfile(),{navigate}=useGame(),ship=equippedCosmetic(profile,'starShip');
  return <GameShell title="Hanggar" eyebrow="STAR PATROL" back="star-patrol"><section className="hangar-ship"><img data-testid="hangar-ship-image" src={ship!.image} alt={ship!.name}/><div><h2 data-testid="hangar-ship-name">{ship!.name}</h2><p data-testid="hangar-sector">Sektor {profile.starLevel||1}</p><button className="text-button" data-testid="hangar-cosmetics" onClick={()=>navigate('koleksi')}>Ganti skin</button></div></section><div className="hangar-upgrades">{STAR_UPGRADES.map(u=><article key={u.key} data-testid={`hangar-upgrade-${u.key}`}><img src={u.image} alt=""/><div><h2>{u.name}</h2><p>{u.description}</p></div><b data-testid={`hangar-level-${u.key}`}>{starUpgradeLevel(profile,u.key)}/3</b></article>)}</div><div className="hangar-actions"><button className="pop-button mint" data-testid="hangar-play" onClick={()=>navigate('star-patrol')}><Play size={18}/>Terbang</button><button className="pop-button" data-testid="hangar-shop" onClick={()=>{sessionStorage.setItem('shop-tab','upgrade');navigate('toko');}}><ShoppingBag size={18}/>Beli upgrade</button></div></GameShell>;
};