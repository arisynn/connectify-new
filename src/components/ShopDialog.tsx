import React,{useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';
import {CosmeticPreview} from './CosmeticPreview';
export const ShopDialog=({item,mode,balance,busy,onClose,onBuy}:any)=>{
  const ref=useRef<HTMLDivElement>(null),purchase=mode==='purchase';
  useEffect(()=>{const previous=document.activeElement as HTMLElement;ref.current?.focus();return()=>previous?.focus();},[]);
  const onKeyDown=(e:React.KeyboardEvent)=>{
    if(e.key==='Escape'&&!busy)onClose();
    if(e.key==='Tab'){const buttons=Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')||[]);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };
  return createPortal(<div className="dialog-backdrop"><section ref={ref} tabIndex={-1} onKeyDown={onKeyDown} className="result-card purchase-card shop-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="shop-dialog-title" data-testid={purchase?'purchase-dialog':'product-preview-dialog'}>
    <button data-testid="shop-dialog-close" className="round-button purchase-close" aria-label="Tutup detail" disabled={busy} onClick={onClose}><X size={17}/></button>
    <span className="eyebrow" data-testid="shop-dialog-caption">{purchase?'MILIKI GAYA BARUMU':'LIHAT LEBIH DEKAT'}</span>
    <h2 id="shop-dialog-title" data-testid="purchase-title">{item.name}</h2>
    {item.category==='theme'&&!purchase?<div className="theme-full-preview" data-testid="theme-full-preview">{item.allImages.map((src:string,i:number)=><img data-testid={`theme-detail-image-${i}`} key={src} src={src} alt={`${item.name} gambar ${i+1}`}/>)}</div>:<CosmeticPreview item={item} context="detail"/>}
    <p data-testid="purchase-description">{item.description}</p>
    {item.members&&<p className="catalog-note" data-testid="purchase-pack-contents">Termasuk 1×1, 1×2 / 2×1, dan 2×2. Satu pembelian, pakai bersamaan.</p>}
    {purchase?<><p data-testid="purchase-balance">Saldo: {balance} Permen · {item.category==='help'?'1 bantuan':'Milikmu selamanya'}</p><button className="pop-button mint" data-testid="purchase-confirm" disabled={busy||balance<item.price} onClick={onBuy}>{busy?'Mencatat…':`Beli ${item.members?'set':'item'} · ${item.price} Permen`}</button>{balance<item.price&&<p data-testid="purchase-insufficient">Permen belum cukup.</p>}</>:<p className="fine-print" data-testid="preview-no-charge">Pratinjau saja. Saldo dan perlengkapanmu tidak berubah.</p>}
  </section></div>,document.body);
};