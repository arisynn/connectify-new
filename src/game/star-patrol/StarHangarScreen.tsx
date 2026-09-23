import React,{useState} from 'react';
import {Play,ShoppingBag,Check,Lock,Crosshair} from 'lucide-react';
import {GameShell} from '../../components/GameShell';
import {useGame} from '../../GameContext';
import {useProfile} from '../../core/profile/ProfileContext';
import {equippedCosmetic,ownsCosmetic} from '../../core/cosmetics';
import {STAR_UPGRADES,STAR_SHIPS,SHIP_SIGNATURES,starUpgradeLevel} from '../../core/starPatrol';
import {useCDE} from '../../core/cde';
import './star-patrol.css';
export const StarHangarScreen=()=>{
  const {profile}=useProfile(),{navigate}=useGame(),cde=useCDE(),ship=equippedCosmetic(profile,'starShip')!;
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState(ship.id);
  const selected=STAR_SHIPS.find(s=>s.id===preview)||ship,signature=SHIP_SIGNATURES[selected.id.replace('ship_','')],owned=ownsCosmetic(profile,selected.id);
  const equip=async()=>{if(busy)return;setBusy(true);setError('');try{await cde.commitMutation('UPDATE_PROFILE',{equippedCosmetics:{...profile.equippedCosmetics,starShip:selected.id}});}catch{setError('Pesawat belum tersimpan. Coba lagi setelah tersambung.');}finally{setBusy(false);}};
  return <GameShell title="Hanggar" eyebrow="INFINITY / ARMADA PILOT" back="star-patrol">
    <section className="hangar-ship"><img data-testid="hangar-ship-image" src={selected.image} alt={selected.name}/><div><h2 data-testid="hangar-ship-name">{selected.name}</h2><p data-testid="hangar-sector">Sektor {profile.starLevel||1}</p>{ship.id===selected.id?<span className="hangar-equipped" data-testid="hangar-equipped"><Check size={14}/>Sedang dipakai</span>:owned?<button className="text-button" disabled={busy} data-testid="hangar-equip" onClick={equip}>{busy?'Menyimpan…':'Pakai pesawat'}</button>:<button className="text-button" data-testid="hangar-cosmetics" onClick={()=>{sessionStorage.setItem('shop-tab','gaya');navigate('toko');}}>Buka di toko · {selected.price} Permen</button>}</div></section>
    <div className="hangar-signature" data-testid="hangar-signature"><Crosshair size={22}/><div><span data-testid="hangar-weapon-name">{signature.name}</span><p data-testid="hangar-weapon-description">{signature.description}</p></div></div>
    <div className="hangar-fleet" aria-label="Pratinjau pesawat">{STAR_SHIPS.map(s=><button data-testid={`hangar-preview-${s.id}`} key={s.id} aria-label={`Pratinjau ${s.name}`} aria-pressed={s.id===selected.id} onClick={()=>setPreview(s.id)}><img src={s.image} alt={s.name}/>{!ownsCosmetic(profile,s.id)&&<Lock size={10}/>}<span>{s.name}</span></button>)}</div>
    <p className="hangar-fleet-note" data-testid="hangar-fleet-note">Pilih pesawat untuk melihat senjata khasnya. Power-up bersifat sementara; setelah habis, senjata khas aktif kembali.</p>
    {error&&<p role="alert" data-testid="hangar-save-error">{error}</p>}
    <div className="hangar-upgrades">{STAR_UPGRADES.map(u=><article key={u.key} data-testid={`hangar-upgrade-${u.key}`}><img src={u.image} alt=""/><div><h2 data-testid={`hangar-upgrade-name-${u.key}`}>{u.name}</h2><p data-testid={`hangar-upgrade-description-${u.key}`}>{u.description}</p></div><b data-testid={`hangar-level-${u.key}`}>{starUpgradeLevel(profile,u.key)}/3</b></article>)}</div>
    <div className="hangar-actions"><button className="pop-button mint" data-testid="hangar-play" onClick={()=>navigate('star-patrol')}><Play size={18}/>Terbang</button><button className="pop-button" data-testid="hangar-shop" onClick={()=>{sessionStorage.setItem('shop-tab','upgrade');navigate('toko');}}><ShoppingBag size={18}/>Beli upgrade</button></div>
  </GameShell>;
};