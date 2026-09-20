import React,{useState,useEffect} from 'react';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useAudio} from '../core/audio/AudioEngine';
import {GameShell} from '../components/GameShell';
import {KineticModal} from '../designs/KineticPopups';
import {EconomyMeter} from '../components/EconomyMeter';
import {CHEST_TYPES,openChestAction,calculateDynamicSpeedUpCost,CHEST_POINTS_REQUIRED} from '../core/chest';
import {artIcon} from '../core/artAssets';
export const ChestScreen=()=>{
  const {profile}=useProfile(),cde=useCDE(),audio=useAudio();
  const [now,setNow]=useState(Date.now()),[reward,setReward]=useState<any>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState<number|null>(null);
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
  const open=async(index:number)=>{if(busy!==null)return;const result=openChestAction(profile,index);if(result.rewards?.error){setMessage('Batas Permen harian tercapai. Petimu tetap aman untuk nanti.');return;}if(!result.rewards?.chestType)return;setBusy(index);try{await cde.queueMutation('OPEN_CHEST',{slotId:index});setReward(result.rewards);audio.playSfx('uiReward');}catch{setMessage('Peti belum dapat dibuka. Tunggu sinkronisasi.');}finally{setBusy(null);}};
  const speedUp=async(index:number)=>{if(busy!==null)return;setBusy(index);try{await cde.queueMutation('SPEED_UP_CHEST',{slotId:index});audio.playUiClick();}catch{setMessage('Belum dapat dipercepat. Periksa saldo dan koneksimu.');}finally{setBusy(null);}};
  const progress=Math.min(profile.chestProgress||0,CHEST_POINTS_REQUIRED);
  return <GameShell title="Pojok hadiah" eyebrow="KEJUTAN DARI PERJALANANMU" wide><div data-testid="chest-screen">
    <div className="club-page-banner"><div><span className="eyebrow" data-testid="chest-banner-caption">PROGRES KECIL. KEJUTAN MANIS.</span><h2 data-testid="chest-banner-title">Ada hadiah menunggumu.</h2><p data-testid="chest-reward-policy">Biasa 5 · Langka 8 · Epik 10 Permen + booster. Setiap peti ke-7 dijamin Epik.</p></div><img src="/art/premium/chests/epic.webp" alt=""/></div>
    <EconomyMeter compact id="chest-income"/>{message&&<p data-testid="chest-limit-message" role="status" className="shop-message">{message}</p>}
    <div className="chest-progress"><span data-testid="chest-progress-caption">Peti berikutnya</span><progress data-testid="chest-progress" aria-label="Progres peti berikutnya" value={progress} max={CHEST_POINTS_REQUIRED}/><b data-testid="chest-points">{progress}/{CHEST_POINTS_REQUIRED} PTS</b></div>
    <div className="chest-slot-grid">{(profile.chestSlots||[null,null,null]).map((chest:any,i:number)=>{
      const config=chest?CHEST_TYPES[chest.type]:null,remaining=chest?Math.max(0,config.durationMs-(now-chest.startTime)):0,cost=chest?calculateDynamicSpeedUpCost(chest.type,chest.startTime,now):0;
      const seconds=Math.ceil(remaining/1000),time=seconds>=3600?`${Math.floor(seconds/3600)}j ${Math.floor(seconds%3600/60)}m`:`${Math.floor(seconds/60)}m ${seconds%60}d`;
      return <article key={i} data-testid={`chest-slot-${i}`} className={`chest-slot ${chest?'':'empty'}`}><img src={`/art/premium/chests/${chest?.type||'common'}.webp`} alt={config?.name||'Slot peti kosong'}/><h3 data-testid={`chest-name-${i}`}>{config?.name||'Ruang hadiah'}</h3><p data-testid={`chest-timer-${i}`}>{!chest?'Mainkan game favoritmu untuk mengisi peti.':remaining?time:'Siap dibuka!'}</p>{chest&&(remaining?<button data-testid={`chest-speedup-${i}`} className="pop-button sky" disabled={busy!==null||cde.permen<cost} onClick={()=>speedUp(i)}>Percepat · {cost} Permen</button>:<button data-testid={`chest-open-${i}`} className="pop-button mint" disabled={busy!==null} onClick={()=>open(i)}>{busy===i?'Membuka…':'Buka peti'}</button>)}</article>;
    })}</div>
    <KineticModal isOpen={!!reward} title="Hadiah peti" className="text-center"><img className="result-art" src={`/art/premium/chests/${reward?.chestType||'common'}.webp`} alt=""/><span className="eyebrow" data-testid="chest-reward-caption">UNTUK PERJALANAN BERIKUTNYA</span><h2 data-testid="chest-reward-title" className="text-2xl my-3">Peti terbuka!</h2><div data-testid="chest-reward-list" className="chest-reward-grid">{[['permen','Permen','permen'],['hints','Petunjuk','hint'],['shuffles','Acak','shuffle'],['hammers','Palu','hammer'],['bombs','Bom','bomb']].filter(([key])=>reward?.[key]).map(([key,label,icon])=><div data-testid={`chest-reward-${key}`} key={key}><img src={artIcon(icon)} alt=""/><span>+{reward[key]} {label}</span></div>)}</div><button data-testid="chest-reward-claim" className="pop-button mint w-full mt-6" onClick={()=>setReward(null)}>Lanjutkan</button></KineticModal>
  </div></GameShell>;
};