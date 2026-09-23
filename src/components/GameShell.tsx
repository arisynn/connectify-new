import React,{useRef} from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useGame, Screen } from '../GameContext';
import { useTheme } from '../core/theme/ThemeProvider';
import { useProfile } from '../core/profile/ProfileContext';
import { DynamicIcon } from './theme/DynamicIcon';

export const ModeToggle = ({id='theme-mode'}:{id?:string}) => {
  const {darkMode,toggleDarkMode}=useTheme();
  return <button data-testid={id} className="round-button" onClick={toggleDarkMode} aria-label={darkMode?'Aktifkan tema terang':'Aktifkan tema gelap'} title={darkMode?'Tema terang':'Tema gelap'}>{darkMode?<Sun size={20}/>:<Moon size={20}/>}</button>;
};
export const GameShell = ({title,eyebrow,back='home',children,wide=false,onBack}:{title:string,eyebrow?:string,back?:Screen,children:React.ReactNode,wide?:boolean,onBack?:()=>void}) => {
  const {navigate,screen}=useGame();const {profile}=useProfile();
  const scroll=useRef<HTMLDivElement>(null);
  const root=['home','prestasi','toko','profile'].includes(screen);
  return <section className={`game-shell ${wide?'wide':''}`} data-testid={`screen-${title.toLowerCase().replace(/\s/g,'-')}`}>
    <header className="shell-header">
      {!root&&<button data-testid="shell-back" className="round-button" aria-label="Kembali" onClick={()=>onBack?onBack():navigate(back)}><ArrowLeft size={22}/></button>}
      <div className="shell-heading"><span className="eyebrow" data-testid="shell-eyebrow">{eyebrow||'CONNECTIFY CLUB'}</span><h1 data-testid="shell-title">{title}</h1></div>
      <span className="balance-button" data-testid="shell-balance"><DynamicIcon name="permen" className="w-6 h-6"/><b>{profile.coins}</b></span>
    </header>
    <div className="shell-content" ref={scroll}>{children}</div>
  </section>;
};