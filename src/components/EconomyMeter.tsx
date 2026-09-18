import React from 'react';
import { ReceiptText, ArrowUpRight } from 'lucide-react';
import { useProfile } from '../core/profile/ProfileContext';
import { useGame } from '../GameContext';
import { getDailyIncome } from '../core/economy';

export const EconomyMeter = ({compact=false,id='income-meter'}:{compact?:boolean,id?:string}) => {
  const {profile}=useProfile(),{navigate}=useGame();const amount=getDailyIncome(profile);
  return <button data-testid={id} className={`economy-meter ${compact?'compact':''}`} onClick={()=>navigate('ledger')}>
    <div className="economy-label"><ReceiptText size={18}/><span>Pendapatan hari ini</span><b data-testid={`${id}-amount`}>{amount}<small> / 100</small></b><ArrowUpRight size={17}/></div>
    <div className="economy-track" role="progressbar" aria-valuenow={amount} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${amount}%`}}/></div>
    {!compact&&<p data-testid={`${id}-rule`}>Peti, misi & pencapaian saja. Reset pukul 00.00 WIB.</p>}
  </button>;
};