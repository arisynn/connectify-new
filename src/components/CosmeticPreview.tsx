import React from 'react';
import {ArrowUp, Sparkles, RefreshCw, Lightbulb, Hammer, Bomb} from 'lucide-react';
export const CosmeticPreview=({item}:{item:any})=>{
  const Icons:any={shuffle:RefreshCw,hint:Lightbulb,hammer:Hammer,bomb:Bomb};const Icon=Icons[item.id]||Sparkles;
  if(item.category==='help')return <div className="product-art help" aria-hidden="true"><Icon size={39}/></div>;
  if(item.category==='theme')return <div className="product-art theme" aria-hidden="true">{item.images?.map((src:string,i:number)=><img key={i} src={src} alt=""/>)}</div>;
  if(item.category==='avatar'||item.category==='effect')return <div className={`product-art ${item.category}`}><img data-testid={`product-art-${item.id}`} src={`/art/atelier/${item.asset}.svg`} alt={item.name}/></div>;
  if(item.category==='frame')return <div className="product-art"><div className={`preview-frame frame-${item.asset}`}><img src="/art/atelier/mochi.svg" alt=""/></div></div>;
  return <div className="product-art" aria-hidden="true"><div className={`preview-tile slot-${item.slot}`} style={{backgroundImage:`url(/art/atelier/${item.asset}.svg)`}}>{item.slot==='arrow'?<ArrowUp size={34}/>:item.category==='block'?<div className="skin-grid">{[0,1,2,3].map(n=><i key={n} style={{backgroundImage:`url(/art/atelier/${item.asset}.svg)`}}/>)}</div>:<img src="/art/candy/0.webp" alt=""/>}</div></div>;
};