import React,{useState} from 'react';
import { Check } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { AvatarGallery } from '../components/AvatarGallery';
import { useProfile } from '../core/profile/ProfileContext';
import { useGame } from '../GameContext';

const COLORS=['#bde0fe','#fcf6bd','#d0f4de','#ffdac1','#ffd1dc','#1e3a8a','#0f766e','#9f1239'];
export const EditAvatarScreen=()=>{
  const {profile,updateProfile}=useProfile(),{navigate}=useGame();
  const [avatar,setAvatar]=useState(profile.activeAvatarId||'avatar_male'),[bg,setBg]=useState(profile.activeAvatarBackground||COLORS[0]);
  const save=()=>{updateProfile({activeAvatarId:avatar,avatar,activeAvatarBackground:bg,equippedCosmetics:{...profile.equippedCosmetics,avatar:null}});navigate('profile');};
  return <GameShell title="Temukan karaktermu" eyebrow="AVATAR • KOLEKSI PRIBADI" back="profile">
    <p data-testid="avatar-intro" className="page-lede">Bukan dibeli. Didapatkan dari petualanganmu. Buka 9 teman baru dengan bermain.</p>
    <AvatarGallery selected={avatar} onSelect={setAvatar}/>
    <div className="section-heading"><h2 data-testid="avatar-background-heading">Warna latar favorit</h2></div><div className="avatar-colors">{COLORS.map((color,i)=><button key={color} data-testid={`avatar-color-${i}`} aria-label={`Warna latar ${i+1}`} aria-pressed={bg===color} onClick={()=>setBg(color)} style={{backgroundColor:color}}>{bg===color&&<Check size={18}/>}</button>)}</div>
    <button data-testid="avatar-save" className="pop-button pink" onClick={save}>Simpan avatar<Check size={17}/></button>
  </GameShell>;
};