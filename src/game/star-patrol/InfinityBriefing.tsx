import React,{useState} from 'react';
import {Play,ArrowUpRight,ScanLine,Wrench,Zap,Infinity as InfinityIcon} from 'lucide-react';
import {INFINITY_ART,SECTORS} from './sectors';
import {ENEMIES} from './armada';
import {POWERUPS} from './StarArsenal';
import {SHIP_SIGNATURES} from '../../core/starPatrol';
import {KineticModal} from '../../designs/KineticPopups';

export const InfinityBriefing=({ship,record,bestWave,ready,error,onStart,onHangar}:{ship:string;record:number;bestWave:number;ready:boolean;error?:string;onStart:()=>void;onHangar:()=>void})=>{
  const [boss,setBoss]=useState(0),[intel,setIntel]=useState(false),[arsenal,setArsenal]=useState(false),target=SECTORS[boss];
  const signature=SHIP_SIGNATURES[ship.split('/').pop()?.replace('.png','')||'scout'];
  return <section className="infinity-briefing" data-testid="star-launch"><div className="infinity-briefing-inner">
    <div className="infinity-intro">
      <span className="infinity-eyebrow" data-testid="infinity-edition"><i/> CONNECTIFY ARCADE / ENDLESS SHOOTER</span>
      <h2 className="infinity-wordmark" data-testid="star-launch-title">INFINITY<span>BEYOND THE STARS</span></h2>
      <p className="infinity-tagline" data-testid="infinity-tagline">Selama kamu bertahan, permainan terus berjalan.</p>
      <div className="infinity-ship-display"><div className="infinity-orbit orbit-two"/><div className="infinity-orbit"/><span className="infinity-ship-coordinate" data-testid="infinity-flight-status">ARMADA SIAP<br/>SISTEM ONLINE</span><img data-testid="infinity-hero-ship" src={ship} alt="Pesawat Infinity pilihanmu"/><span className="infinity-auto" data-testid="infinity-auto-fire">AUTO<br/><b>FIRE</b></span></div>
      <div className="infinity-intro-bottom"><div data-testid="star-record"><small>REKOR PERSONAL</small><strong>{record.toLocaleString('id-ID')}</strong></div><div data-testid="infinity-best-wave"><small>GELOMBANG TERJAUH</small><strong>{bestWave||'—'}</strong></div><button className="infinity-text-button" data-testid="star-open-hangar" onClick={onHangar}><Wrench size={17}/> Hanggar <ArrowUpRight size={16}/></button></div>
      <button className="infinity-intel-button" data-testid="infinity-open-intel" onClick={()=>setIntel(true)}><div className="infinity-enemy-thumbs">{Object.keys(ENEMIES).map(kind=><img data-testid={`infinity-preview-${kind}`} key={kind} src={`${INFINITY_ART}/${kind}.png`} alt={ENEMIES[kind as keyof typeof ENEMIES].name}/>)}</div><span>6 tipe musuh · 5 pola formasi <ScanLine size={16}/></span></button>
      <button className="infinity-arsenal-link" data-testid="infinity-open-arsenal" onClick={()=>setArsenal(true)}><Zap size={13}/> Drone, senjata & power-up <ArrowUpRight size={14}/></button>
    </div>
    <div className="infinity-mission-panel">
      <div className="infinity-section-heading"><span className="infinity-eyebrow" data-testid="infinity-mode-heading">SATU PENERBANGAN. TANPA BATAS.</span><InfinityIcon size={21}/></div>
      <div className="infinity-endless-loop" data-testid="infinity-endless-rule"><span>3 gelombang</span><ArrowUpRight size={14}/><span>Lawan boss</span><ArrowUpRight size={14}/><b>Terus bertahan</b></div>
      <p className="infinity-loop-description" data-testid="infinity-loop-description">Boss kalah? Armada berikutnya langsung datang, lebih kuat. Tidak ada garis finis.</p>
      <div className="infinity-section-heading"><span className="infinity-eyebrow" data-testid="infinity-boss-gallery-title">KENALI PARA BOSS</span><span data-testid="infinity-boss-gallery-count">6 ancaman berbeda</span></div>
      <div className="infinity-sector-grid">{SECTORS.map((s,i)=><button key={s.bossArt} className={`infinity-sector ${i===boss?'is-selected':''}`} style={{'--sector-color':s.color} as React.CSSProperties} data-testid={`infinity-boss-card-${i}`} aria-label={`Lihat ${s.boss}`} aria-pressed={i===boss} onClick={()=>setBoss(i)}><span className="sector-topline"><b>0{i+1}</b><ScanLine size={11}/></span><img data-testid={`infinity-boss-art-${i}`} src={`${INFINITY_ART}/${s.bossArt}.png`} alt={s.boss}/><span data-testid={`infinity-boss-title-${i}`}>{s.boss}</span></button>)}</div>
      <div className="infinity-mission-details"><div className="infinity-boss-preview"><img src={`${INFINITY_ART}/${target.bossArt}.png`} alt=""/><div><small data-testid="infinity-boss-label">POLA SERANGAN</small><b data-testid="infinity-boss-name">{target.boss}</b></div><span data-testid="infinity-boss-pattern">{target.pattern}<br/>2 fase serangan</span></div></div>
      <div className="infinity-equipped-weapon" data-testid="infinity-equipped-weapon"><CrosshairMark/><span>Senjata pesawatmu</span><b>{signature?.name||'Twin Ion'}</b></div>
      <button className="infinity-primary" data-testid="star-start" disabled={!ready} onClick={onStart}><Play size={18} fill="currentColor"/>{ready?'Mulai bermain':'Memuat armada…'}<ArrowUpRight size={19}/></button>
      <p className="infinity-controls-hint" data-testid="infinity-controls-hint">Geser pesawat / WASD / tombol panah · Tembak otomatis</p>
      {error&&<p role="alert" data-testid="star-load-error">{error}</p>}
    </div>
  </div>
  <KineticModal isOpen={intel} onClose={()=>setIntel(false)} className="infinity-dialog" widthClass="w-full max-w-lg" title="Armada musuh Infinity"><span className="infinity-eyebrow" data-testid="infinity-intel-caption">DATABASE ARMADA</span><h2 data-testid="infinity-intel-title">Kenali lawanmu.</h2><div className="infinity-intel-grid">{Object.entries(ENEMIES).map(([key,e])=><article data-testid={`infinity-intel-${key}`} key={key}><img src={`${INFINITY_ART}/${key}.png`} alt={e.name}/><div><b>{e.name}</b><p>{e.description}</p></div><span>{e.hp} HP dasar</span></article>)}</div><p className="infinity-controls-hint" data-testid="infinity-intel-note">Musuh datang dalam formasi V, barisan, sayap kembar, berlian, dan busur. Setiap boss yang dikalahkan meningkatkan kesulitan.</p></KineticModal>
  <KineticModal isOpen={arsenal} onClose={()=>setArsenal(false)} className="infinity-dialog" widthClass="w-full max-w-lg" title="Arsenal Infinity"><span className="infinity-eyebrow" data-testid="infinity-arsenal-caption">BANTUAN DI MEDAN TEMPUR</span><h2 data-testid="infinity-arsenal-title">Lebih dari sekadar laser.</h2><div className="infinity-intel-grid">{POWERUPS.map(p=><article key={p.id} data-testid={`infinity-power-info-${p.id}`}><img src={`${INFINITY_ART}/${p.asset}.png`} alt={p.name}/><div><b>{p.name}</b><p>{p.description}</p></div></article>)}</div><p className="infinity-controls-hint" data-testid="infinity-power-info-note">Setiap 4 musuh yang dikalahkan menjatuhkan power-up. Dekati untuk memungutnya. Senjata baru mengganti boost senjata sebelumnya; drone dan perisai bisa aktif bersamaan.</p></KineticModal>
  </section>;
};
const CrosshairMark=()=> <Zap size={13}/>;