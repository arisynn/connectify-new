import React from 'react';
import { Home, Gamepad2, Target, ShoppingBag, UserRound } from 'lucide-react';
import { Screen, useGame } from '../GameContext';
const tabs:{id:Screen,label:string,icon:any}[]=[{id:'home',label:'Beranda',icon:Home},{id:'levels',label:'Main',icon:Gamepad2},{id:'misi',label:'Misi',icon:Target},{id:'toko',label:'Toko',icon:ShoppingBag},{id:'profile',label:'Profil',icon:UserRound}];
const hidden=['boot','startup','login','play','block-puzzle','memory','triple','multiplayer','pesan'];
export const MobileNav=()=>{
  const {screen,navigate}=useGame();
  if(hidden.includes(screen))return null;
  const active=screen==='challenges'?'levels':screen==='prestasi'?'misi':screen==='koleksi'||screen==='tema'?'toko':screen==='settings'||screen==='statistik'||screen==='edit-avatar'||screen==='ledger'?'profile':screen==='peti'?'home':screen;
  return <nav className="mobile-nav" aria-label="Navigasi utama" data-testid="mobile-navigation">{tabs.map(t=><button key={t.id} data-testid={`nav-${t.id}`} aria-current={active===t.id?'page':undefined} className={active===t.id?'active':''} onClick={()=>navigate(t.id)}><t.icon size={21} strokeWidth={active===t.id?2.5:1.8}/><span>{t.label}</span></button>)}</nav>;
};