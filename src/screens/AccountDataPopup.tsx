import React,{useState,useEffect} from 'react';
import {Cloud} from 'lucide-react';
import {KineticModal} from '../designs/KineticPopups';
import {useCDE} from '../core/cde';
import {CDE} from '../core/cde/CDE';
interface Props{isOpen:boolean;onClose:()=>void;onLogout:()=>void;profileId:string;onReset:()=>void}
export const AccountDataPopup:React.FC<Props>=({isOpen,onClose,profileId})=>{
  const cde=useCDE(),[outbox,setOutbox]=useState<any[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{if(isOpen)CDE.getPendingOperations().then(setOutbox).catch(()=>setError('Antrean belum dapat dibaca.'));},[isOpen,cde.syncStatus]);
  const sync=async()=>{setBusy(true);setError('');try{await CDE.forceSync();setOutbox(await CDE.getPendingOperations());}catch{setError('Belum tersambung. Progres lokal tetap tersimpan.');}finally{setBusy(false);}};
  return <KineticModal isOpen={isOpen} onClose={onClose} title="Status akun" widthClass="w-full max-w-md"><span className="eyebrow" data-testid="account-data-caption">AKUN & PROGRES</span><h2 className="text-2xl mt-2 mb-6" data-testid="account-data-title">Semuanya tercatat.</h2>
    <dl className="account-data-list">{[['player','ID Pemain',profileId],['connection','Koneksi',navigator.onLine?'Tersambung':'Terputus'],['session','Sesi',cde.account?'Aktif':'Lokal'],['revision','Revisi',cde.profile?.revision||0],['pending','Antrean',`${cde.pendingOpsCount} operasi`],['sync','Sinkronisasi',cde.syncStatus],['last-sync','Terakhir tersimpan',cde.lastSync?new Date(cde.lastSync).toLocaleString('id-ID'):'Belum pernah']].map(([id,label,value])=><div key={id}><dt>{label}</dt><dd data-testid={`account-data-${id}`}>{value}</dd></div>)}</dl>
    <button data-testid="account-data-sync" className="pop-button mint mt-6" disabled={busy} onClick={sync}><Cloud size={18}/>{busy?'Menyinkronkan…':'Sinkronkan sekarang'}</button>{error&&<p role="status" data-testid="account-data-error" className="shop-message mt-4">{error}</p>}
    <div className="account-outbox" data-testid="account-data-outbox">{outbox.length?outbox.map((op,i)=><p data-testid={`account-data-operation-${i}`} key={op.id||i}>{op.type} · {op.status}</p>):<p data-testid="account-data-empty">Antrean bersih. Tidak ada operasi yang menunggu.</p>}</div>
  </KineticModal>;
};