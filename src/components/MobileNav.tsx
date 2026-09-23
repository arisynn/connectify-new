import React from 'react';
import { Home, Trophy, ShoppingBag, UserRound } from 'lucide-react';
import { Screen, useGame } from '../GameContext';
const tabs:{id:Screen,label:string,icon:any}[]=[{id:'home',label:'Hub',icon:Home},{id:'prestasi',label:'Pencapaian',icon:Trophy},{id:'toko',label:'Toko',icon:ShoppingBag},{id:'profile',label:'Profil',icon:UserRound}];
// Game screens (hub menu, gameplay, hangar) own their navigation; the club nav only shows on hub-level screens.
const hidden=['boot','startup','login','game-hub','tema','play','block-puzzle','memory','triple','star-patrol','star-hangar','multiplayer','pesan'];
export const MobileNav=()=>{
  const {screen,navigate}=useGame();
  if(hidden.includes(screen))return null;
  const active=screen==='statistik'?'prestasi':screen==='koleksi'||screen==='tema'?'toko':screen==='settings'||screen==='edit-avatar'||screen==='ledger'?'profile':screen;
  return <nav className="mobile-nav" aria-label="Navigasi utama" data-testid="mobile-navigation">{tabs.map(t=><button key={t.id} data-testid={`nav-${t.id}`} aria-current={active===t.id?'page':undefined} className={active===t.id?'active':''} onClick={()=>navigate(t.id)}><t.icon size={21} strokeWidth={active===t.id?2.5:1.8}/><span>{t.label}</span></button>)}</nav>;
};
