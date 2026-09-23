import React,{useState} from 'react';
import {Gift,Check,Flame} from 'lucide-react';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useAudio} from '../core/audio/AudioEngine';
import {getLoginRewardState} from '../core/loginReward';
import {artIcon} from '../core/artAssets';

// Replaces chests: one Permen grant per day, growing with the login streak.
export const LoginRewardCard=()=>{
  const {profile}=useProfile(),cde=useCDE(),audio=useAudio(),state=getLoginRewardState(profile);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const claim=async()=>{
    if(busy||state.claimedToday)return;setBusy(true);setMessage('');
    try{await cde.commitMutation('CLAIM_LOGIN_REWARD',{});audio.playSfx('uiReward');setMessage(`+${state.amount} Permen tersimpan. Sampai jumpa besok!`);}
    catch(e:any){setMessage(e.message==='LOGIN_REWARD_CLAIMED'?'Hadiah hari ini sudah diklaim.':e.message==='DAILY_INCOME_LIMIT'?'Batas Permen hari ini tercapai. Coba lagi besok.':e.message==='DATABASE_MIGRATION_REQUIRED'?'Server Supabase belum diperbarui. Jalankan migrasi 20260923_login_reward.sql.':'Belum tersimpan. Periksa koneksimu lalu coba lagi.');}
    finally{setBusy(false);}
  };
  return <section className={`login-reward ${state.claimedToday?'claimed':''}`} data-testid="login-reward" aria-label="Hadiah login harian">
    <img src="/art/premium/chests/epic.webp" alt="" className="login-reward-art"/>
    <div className="login-reward-copy"><span className="eyebrow" data-testid="login-reward-caption"><Flame size={11}/> HADIAH LOGIN · HARI {state.streak}</span><b data-testid="login-reward-title">{state.claimedToday?'Sudah diklaim hari ini':`+${state.amount} Permen menunggumu`}</b>
      <div className="login-reward-track" data-testid="login-reward-track">{state.schedule.map((amount:number,i:number)=><span key={i} data-testid={`login-reward-day-${i+1}`} className={i<state.dayIndex||(state.claimedToday&&i===state.dayIndex)?'done':i===state.dayIndex?'today':''}>{amount}</span>)}</div></div>
    <button className="pop-button mint login-reward-claim" data-testid="login-reward-claim" disabled={busy||state.claimedToday} onClick={claim}>{state.claimedToday?<><Check size={16}/>Besok lagi</>:<><Gift size={16}/>{busy?'Menyimpan…':'Klaim'}</>}</button>
    {message&&<p role="status" className="login-reward-message" data-testid="login-reward-message">{message}</p>}
  </section>;
};
