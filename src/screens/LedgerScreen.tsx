import React, {useState} from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, ReceiptText, X } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { EconomyMeter } from '../components/EconomyMeter';
import { useProfile } from '../core/profile/ProfileContext';

export const LedgerScreen=()=>{
  const {profile}=useProfile();const [filter,setFilter]=useState('all'),[receipt,setReceipt]=useState<any>(null);
  const all=profile.ledger||[],list=all.filter((e:any)=>filter==='all'||(filter==='in'?e.amount>0:e.amount<0));
  const download=()=>{
    const text=['Tanggal,Nomor,Sumber,Permen,Saldo',...all.map((e:any)=>[e.at,e.id,e.label,e.amount,e.balance].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='connectify-transaksi.csv';a.click();URL.revokeObjectURL(url);
  };
  return <GameShell title="Dompet Permen" eyebrow="TRANSPARAN. TERKONTROL. TERATUR.">
    <div className="wallet-card" data-testid="wallet-summary"><span className="eyebrow">SALDO TERSEDIA</span><strong data-testid="wallet-balance">{profile.coins}<small>Permen</small></strong><p>Simpan untuk tema favorit dan bantuan saat bermain.</p></div>
    <EconomyMeter id="ledger-income"/>
    <div className="notice-card" data-testid="economy-rules"><b>Ekonomi yang adil</b><p>Hadiah 5–10 Permen, total maksimal 100 per hari. Bermain tidak langsung memberikan Permen. Pengeluaran tidak mengurangi hitungan batas pendapatan.</p></div>
    <div className="section-heading"><h2 data-testid="ledger-title">Riwayat transaksi</h2><button data-testid="ledger-export" className="text-button" onClick={download} disabled={!all.length}><Download size={16}/> CSV</button></div>
    <div className="filter-tabs">{[['all','Semua'],['in','Pemasukan'],['out','Pengeluaran']].map(([id,label])=><button data-testid={`ledger-filter-${id}`} key={id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}</div>
    {!list.length?<div className="empty-state" data-testid="ledger-empty"><ReceiptText size={38}/><h2>Belum ada transaksi</h2><p>Klaim hadiah pertama dari hadiah login, misi, atau pencapaian.</p></div>:<div className="ledger-list">{list.map((e:any)=><button data-testid={`transaction-${e.id}`} key={e.id} className="transaction" onClick={()=>setReceipt(e)}><span className={`transaction-icon ${e.amount>0?'in':'out'}`}>{e.amount>0?<ArrowDownLeft/>:<ArrowUpRight/>}</span><span><b>{e.label.replace('theme_','tema ')}</b><small>{new Date(e.at).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'})} WIB</small></span><strong className={e.amount>0?'income':'expense'}>{e.amount>0?'+':''}{e.amount}</strong></button>)}</div>}
    <p className="fine-print" data-testid="ledger-retention">Menampilkan hingga 200 transaksi terbaru. Unduh CSV untuk arsip pribadi.</p>
    {receipt&&<div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Bukti transaksi" data-testid="receipt-dialog"><div className="receipt-card"><button data-testid="receipt-close" className="round-button" onClick={()=>setReceipt(null)} aria-label="Tutup bukti"><X size={20}/></button><ReceiptText size={36}/><span className="eyebrow">BUKTI TRANSAKSI GAME</span><h2 data-testid="receipt-label">{receipt.label}</h2><strong data-testid="receipt-amount">{receipt.amount>0?'+':''}{receipt.amount} Permen</strong><dl><dt>Nomor</dt><dd data-testid="receipt-number">{receipt.id}</dd><dt>Waktu WIB</dt><dd>{new Date(receipt.at).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}</dd><dt>Saldo setelah transaksi</dt><dd data-testid="receipt-balance">{receipt.balance} Permen</dd></dl><p>Permen adalah mata uang permainan, bukan uang sungguhan.</p></div></div>}
  </GameShell>;
};