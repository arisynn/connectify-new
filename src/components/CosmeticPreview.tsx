import React from 'react';
import { ArrowUp } from 'lucide-react';
import { cosmeticImage, artIcon } from '../core/artAssets';
export const CosmeticPreview=({item,context='catalog'}:{item:any;context?:string})=>{
  const testId=`${context}-art-${item.id}`;
  if(item.category==='help') return <div className="product-art help"><img data-testid={testId} src={artIcon(item.id)} alt={item.name}/></div>;
  if(item.category==='theme') return <div className="product-art theme" data-testid={testId}>{item.images?.map((src:string,i:number)=><img key={src} src={src} alt={`${item.name} ${i+1}`}/>)}</div>;
  if(['avatar','effect'].includes(item.category)) return <div className={`product-art ${item.category}`}><img data-testid={testId} src={cosmeticImage(item)} alt={item.name}/></div>;
  if(item.category==='frame') return <div className="product-art"><div className="preview-frame bitmap-frame"><img src="/art/premium/avatars/mochi.webp" alt=""/><img data-testid={testId} className="frame-overlay" src={cosmeticImage(item)} alt={item.name}/></div></div>;
  return <div className="product-art" data-testid={testId}><div className={`preview-tile bitmap-tile slot-${item.slot}`} style={{backgroundImage:`url(${cosmeticImage(item)})`}}>
    {item.slot==='arrow'?<ArrowUp size={28}/>:item.category==='block'?<div className="skin-grid">{[0,1,2,3].map(n=><i key={n} style={{backgroundImage:`url(${cosmeticImage(item)})`}}/>)}</div>:null}
  </div></div>;
};