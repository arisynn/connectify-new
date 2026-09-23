import React from 'react';
import {Play,RotateCcw,Star} from 'lucide-react';
import {artIcon} from '../../../core/artAssets';
import {VictoryBurst} from '../../../components/VictoryBurst';
import {useDialogFocus} from '../../../components/useDialogFocus';
export const BlockResults=({isPaused,state,onResume,onMenu,onRestart,score,reward,infinity,record,lines,missions,results}:any)=>{
  const won=state==='won',lost=state==='gameover';
  const dialogRef=useDialogFocus(isPaused||won||lost,isPaused&&!won&&!lost?onResume:undefined);
  if(!isPaused&&!won&&!lost)return null;
  return <div className="dialog-backdrop"><section ref={dialogRef} tabIndex={-1} className="result-card" role="dialog" aria-modal="true" aria-labelledby="block-dialog-title" data-testid="block-result-dialog">
    {won&&<VictoryBurst/>}<img className="result-art" src={artIcon(won?'achievements':'block')} alt=""/>
    <span className="eyebrow" data-testid="block-result-caption">{won?'KERJA BAGUS!':lost?'SATU RONDE. SATU PELAJARAN.':'TARIK NAPAS SEBENTAR'}</span>
    <h2 id="block-dialog-title" data-testid={isPaused?'block-paused-title':'block-result-title'}>{won?'Papan selesai!':lost?'Ruangnya penuh.':'Lagi istirahat.'}</h2>
    {isPaused&&!won&&!lost?<><p data-testid="block-pause-help">Susun balok untuk mengisi baris atau kolom. Lanjutkan saat kamu siap.</p><button data-testid="block-resume" className="pop-button mint" onClick={onResume}><Play size={18}/>Lanjutkan</button><button data-testid="block-pause-exit" className="text-button" onClick={onMenu}>Pilih permainan</button></>:<>
      <strong data-testid="block-final-score">{score.toLocaleString('id-ID')}<small>SKOR RONDE INI</small></strong>
      <div className="result-rewards" data-testid="block-win-rewards"><span data-testid="block-earned-xp">+{reward?.xp||0} XP</span>{won&&<span data-testid="block-earned-missions">Misi & pencapaian Block diperbarui</span>}</div>
      {infinity?<p data-testid="infinity-final-record">Rekor {Math.max(score,record).toLocaleString('id-ID')} · {lines} garis</p>:<ul className="block-result-objectives" data-testid="block-result-objectives">{missions.map((m:any,i:number)=><li key={i} data-testid={`block-result-objective-${i}`}><Star size={15} fill={results[i]?'#eab557':'none'}/>{m.description}</li>)}</ul>}
      {reward?.leveledUp&&<p data-testid="block-account-level" className="level-up-notice">Akunmu naik ke Level {reward.accountLevel}!</p>}
      <button data-testid={won?'block-next-level':'block-retry'} className="pop-button mint" onClick={onRestart}>{!won&&<RotateCcw size={17}/>} {won?'Lanjut level berikutnya':'Main lagi'}</button><button data-testid="block-result-menu" className="text-button" onClick={onMenu}>Pilih permainan</button>
    </>}
  </section></div>;
};