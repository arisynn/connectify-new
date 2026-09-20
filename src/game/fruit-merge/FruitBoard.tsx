import React,{useRef} from 'react';
import {FRUITS,FRUIT_WIDTH,FRUIT_HEIGHT,DANGER_LINE} from './catalog';
import {GameParticles} from '../../components/GameParticles';
export const FruitBoard=({state,aim,setAim,onDrop,onStart,animation,basket}:any)=>{
  const stage=useRef<HTMLDivElement>(null);
  const xFrom=(e:React.PointerEvent<HTMLDivElement>)=>{const rect=(stage.current||e.currentTarget).getBoundingClientRect();return Math.max(FRUITS[state.current].radius,Math.min(FRUIT_WIDTH-FRUITS[state.current].radius,(e.clientX-rect.left)/rect.width*FRUIT_WIDTH));};
  const current=FRUITS[state.current];
  return <div className={`fruit-basket ${state.danger?'danger':''} ${basket?'skinned':''}`} data-testid="fruit-board" data-basket={basket?.id||'basket_rattan'} role="application" tabIndex={0} aria-label="Papan Fruit Merge. Ketuk atau geser lalu lepas untuk menjatuhkan buah. Keyboard: panah lalu spasi."
    style={basket?{['--basket-skin' as any]:`url(${basket.image})`}:undefined}
    onPointerDown={e=>{if(state.phase==='playing'){e.currentTarget.setPointerCapture(e.pointerId);setAim(xFrom(e));}}} onPointerMove={e=>{if(state.phase==='playing'&&e.buttons)setAim(xFrom(e));}} onPointerUp={e=>{if(state.phase==='playing'){const x=xFrom(e);setAim(x);onDrop(x);}}}
    onKeyDown={e=>{if(state.phase!=='playing')return;if(['ArrowLeft','ArrowRight',' ','Enter'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')setAim(Math.max(current.radius,aim-12));if(e.key==='ArrowRight')setAim(Math.min(FRUIT_WIDTH-current.radius,aim+12));if(e.key===' '||e.key==='Enter')onDrop(aim);}}>
    <div className="fruit-stage" ref={stage} data-testid="fruit-stage">
      <div className="fruit-danger-line" style={{top:`${DANGER_LINE/FRUIT_HEIGHT*100}%`}} data-testid="fruit-danger-line"><span>{state.danger?'Tumpukan terlalu tinggi':'BATAS KERANJANG'}</span></div>
      {state.phase==='playing'&&<><div className="fruit-aim-line" style={{left:`${aim/FRUIT_WIDTH*100}%`}}/><img className="fruit-aim-image" data-testid="fruit-current-preview" src={current.image} alt={current.name} style={{left:`${aim/FRUIT_WIDTH*100}%`,width:`${current.radius*2/FRUIT_WIDTH*100}%`}}/></>}
      {state.fruits.map((f:any)=><img key={f.id} data-testid={`fruit-piece-${f.id}`} data-level={f.level} className="fruit-piece" src={FRUITS[f.level].image} alt={FRUITS[f.level].name} style={{width:`${FRUITS[f.level].radius*2/FRUIT_WIDTH*100}%`,left:`${f.x/FRUIT_WIDTH*100}%`,top:`${f.y/FRUIT_HEIGHT*100}%`,transform:`translate(-50%,-50%) rotate(${f.angle}rad)`}}/>)}
      {state.effects.map((e:any)=><span key={e.id} className="fruit-effect-origin" style={{left:`${e.x/FRUIT_WIDTH*100}%`,top:`${e.y/FRUIT_HEIGHT*100}%`}}><GameParticles item={animation} id={`fruit-merge-animation-${e.id}`} count={6}/></span>)}
    </div>
    {state.phase==='ready'&&<div className="fruit-ready-overlay"><img src="/art/premium/fruit-merge/12.webp" alt=""/><span className="eyebrow" data-testid="fruit-start-caption">DARI CERI JADI SEMANGKA</span><h2 data-testid="fruit-start-title">Gabung yang sama.</h2><p data-testid="fruit-start-instructions">Ketuk di mana saja untuk menjatuhkan buah. Dua buah sama menjadi buah yang lebih besar.</p><button data-testid="fruit-start" className="pop-button mint" onClick={onStart}>Mulai meracik</button></div>}
  </div>;
};
