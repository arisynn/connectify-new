import React,{useState} from 'react';
import {Check,Lock} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {PlayerPortrait} from '../components/PlayerPortrait';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useGame} from '../GameContext';
import {COSMETICS,ownsCosmetic,equippedCosmetic} from '../core/cosmetics';
import {AVATARS,isAvatarUnlocked} from '../core/avatars';
import '../simple-club.css';
const COLORS=[['#bde0fe','Langit'],['#fcf6bd','Kuning'],['#d0f4de','Mint'],['#ffdac1','Persik'],['#ffd1dc','Mawar'],['#0f766e','Laut']];
export const EditAvatarScreen=()=>{
  const {profile}=useProfile(),cde=useCDE(),{navigate}=useGame(),current=equippedCosmetic(profile,'avatar');
  const original=current?`cosmetic:${current.id}`:`base:${profile.activeAvatarId||'avatar_male'}`;
  const [selection,setSelection]=useState(original),[bg,setBg]=useState(profile.activeAvatarBackground||COLORS[0][0]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[locked,setLocked]=useState(false);
  const [kind,id]=selection.split(':');
  const patch={...(kind==='base'?{activeAvatarId:id,avatar:id}:{}),activeAvatarBackground:bg,equippedCosmetics:{avatar:kind==='cosmetic'?id:null}};
  const options=[...AVATARS.map(a=>({...a,key:`base:${a.id}`,unlocked:isAvatarUnlocked(profile,a)})),...COSMETICS.filter(c=>c.category==='avatar'&&ownsCosmetic(profile,c.id)).map(c=>({...c,key:`cosmetic:${c.id}`,unlocked:true,requirement:'Koleksimu'}))];
  const save=async()=>{if(busy)return;setBusy(true);setError('');try{await cde.commitMutation('UPDATE_PROFILE',patch);navigate('profile');}catch(e:any){setError(e.message==='AVATAR_LOCKED'?'Avatar ini belum terbuka. Pilih avatar milikmu.':e.message==='SAVE_PENDING'?'Penyimpanan masih menunggu koneksi. Buka profil setelah akun tersambung.':'Foto profil belum tersimpan. Coba simpan lagi saat tersambung.');}finally{setBusy(false);}};
  return <GameShell title="Foto profil" eyebrow="PROFIL" back="profile"><div className="simple-avatar-editor">
    <div className="simple-avatar-preview" data-testid="avatar-live-preview"><PlayerPortrait id="avatar-editor-portrait" profileOverride={{...profile,...patch,equippedCosmetics:{...profile.equippedCosmetics,...patch.equippedCosmetics}}}/><span data-testid="avatar-preview-name">{options.find(o=>o.key===selection)?.name||'Avatar'}</span></div>
    <div className="avatar-colors">{COLORS.map(([color,label],i)=><button disabled={busy} key={color} data-testid={`avatar-color-${i}`} aria-label={`Warna ${label}`} aria-pressed={bg===color} onClick={()=>setBg(color)} style={{backgroundColor:color}}>{bg===color&&<Check size={17}/>}</button>)}</div>
    <div className="simple-avatar-tabs" role="tablist" aria-label="Koleksi avatar"><button role="tab" data-testid="avatar-tab-owned" aria-selected={!locked} onClick={()=>setLocked(false)}>Milikmu</button><button role="tab" data-testid="avatar-tab-locked" aria-selected={locked} onClick={()=>setLocked(true)}>Belum terbuka</button></div>
    <div className="simple-avatar-grid">{options.filter(o=>locked?!o.unlocked:o.unlocked).map(o=>{const [type,avatarId]=o.key.split(':');return <button key={o.key} data-testid={type==='base'?`avatar-select-${o.id}`:`avatar-cosmetic-${o.id}`} disabled={!o.unlocked||busy} aria-pressed={selection===o.key} aria-label={o.name} onClick={()=>setSelection(o.key)}><PlayerPortrait id={`avatar-option-${o.id}`} profileOverride={{...profile,activeAvatarId:avatarId,equippedCosmetics:{avatar:type==='cosmetic'?avatarId:null},activeAvatarBackground:bg}}/><b>{o.name}</b>{selection===o.key&&<Check className="avatar-selected-check" size={16}/>}<small data-testid={`avatar-requirement-${o.id}`}>{!o.unlocked?<><Lock size={11}/>{o.requirement}</>:' '}</small></button>;})}</div>
    {error&&<p data-testid="avatar-save-error" role="alert" className="shop-message">{error}</p>}<div className="avatar-save-bar"><button data-testid="avatar-save" className="pop-button mint" disabled={busy||(selection===original&&bg===profile.activeAvatarBackground)} onClick={save}>{busy?'Menyimpan…':'Simpan'}<Check size={17}/></button></div>
  </div></GameShell>;
};