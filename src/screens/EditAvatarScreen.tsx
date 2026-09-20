import React,{useState} from 'react';
import {Check} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {AvatarGallery} from '../components/AvatarGallery';
import {PlayerPortrait} from '../components/PlayerPortrait';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useGame} from '../GameContext';
import {COSMETICS,ownsCosmetic,equippedCosmetic} from '../core/cosmetics';
import {cosmeticImage} from '../core/artAssets';
const COLORS=[['#bde0fe','Langit'],['#fcf6bd','Mentega'],['#d0f4de','Mint'],['#ffdac1','Persik'],['#ffd1dc','Mawar'],['#1e3a8a','Malam'],['#0f766e','Laut'],['#9f1239','Beri']];
export const EditAvatarScreen=()=>{
  const {profile}=useProfile(),cde=useCDE(),{navigate}=useGame(),current=equippedCosmetic(profile,'avatar');
  const [selection,setSelection]=useState(current?`cosmetic:${current.id}`:`base:${profile.activeAvatarId||'avatar_male'}`),[bg,setBg]=useState(profile.activeAvatarBackground||COLORS[0][0]),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [kind,id]=selection.split(':'),cosmetics=COSMETICS.filter(c=>c.category==='avatar'&&ownsCosmetic(profile,c.id));
  const patch={...(kind==='base'?{activeAvatarId:id,avatar:id}:{}),activeAvatarBackground:bg,equippedCosmetics:{...profile.equippedCosmetics,avatar:kind==='cosmetic'?id:null}};
  const changed=selection!==(current?`cosmetic:${current.id}`:`base:${profile.activeAvatarId||'avatar_male'}`)||bg!==profile.activeAvatarBackground;
  const save=async()=>{if(busy)return;setBusy(true);setError('');try{await cde.queueMutation('UPDATE_PROFILE',patch);navigate('profile');}catch{setError('Avatar belum tersimpan. Coba lagi setelah akun tersambung.');}finally{setBusy(false);}};
  return <GameShell title="Gaya profilmu" eyebrow="SATU PILIHAN. TAMPIL DI SELURUH KLUB." back="profile" wide>
    <div className="avatar-editor-preview" data-testid="avatar-live-preview"><PlayerPortrait id="avatar-editor-portrait" profileOverride={{...profile,...patch}}/><div><h2 data-testid="avatar-preview-title">Ini tampilan barumu.</h2><p data-testid="avatar-preview-copy">Ganti avatar atau warnanya. Bingkai dan kosmetik lain tetap dipertahankan.</p></div></div>
    <div className="section-heading"><h2 data-testid="avatar-background-heading">Warna latar</h2></div><div className="avatar-colors">{COLORS.map(([color,label],i)=><button key={color} data-testid={`avatar-color-${i}`} aria-label={`Warna ${label}`} aria-pressed={bg===color} onClick={()=>setBg(color)} style={{backgroundColor:color}}>{bg===color&&<Check size={18}/>}</button>)}</div>
    {cosmetics.length>0&&<><div className="section-heading"><h2 data-testid="avatar-cosmetics-title">Karakter dari koleksimu</h2></div><div className="avatar-gallery">{cosmetics.map(c=><button data-testid={`avatar-cosmetic-${c.id}`} key={c.id} aria-pressed={selection===`cosmetic:${c.id}`} className={`avatar-card unlocked ${selection===`cosmetic:${c.id}`?'active':''}`} onClick={()=>setSelection(`cosmetic:${c.id}`)}><div className="avatar-portrait"><img src={cosmeticImage(c)} alt={c.name}/>{selection===`cosmetic:${c.id}`&&<span className="avatar-check"><Check size={18}/></span>}</div><b>{c.name}</b><small>Milikmu</small></button>)}</div></>}
    <div className="section-heading"><h2 data-testid="avatar-base-title">Teman dari petualangan</h2></div><p className="page-lede" data-testid="avatar-intro">Avatar ini terbuka lewat progres permainan. Pilihan terkunci tidak dapat dipakai.</p><AvatarGallery selected={kind==='base'?id:''} onSelect={id=>setSelection(`base:${id}`)}/>
    {error&&<p data-testid="avatar-save-error" role="alert" className="shop-message">{error}</p>}<div className="avatar-save-bar"><button data-testid="avatar-save" className="pop-button pink" disabled={busy||!changed} onClick={save}>{busy?'Menyimpan…':'Simpan perubahan'}<Check size={17}/></button><p data-testid="avatar-save-note">Belum disimpan? Tombol kembali tidak mengubah profilmu.</p></div>
  </GameShell>;
};