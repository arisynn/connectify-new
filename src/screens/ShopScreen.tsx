import React,{useState} from 'react';
import {Candy,Check,ShoppingBag,Eye} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useTheme} from '../core/theme/ThemeProvider';
import {useAudio} from '../core/audio/AudioEngine';
import {COSMETICS,ownsCosmetic,isCosmeticEquipped,cosmeticEquipPatch} from '../core/cosmetics';
import {ownsTheme} from '../core/artRewards';
import {ITEM_PRICES,ITEM_FIELD,getItemPrice} from '../core/economy';
import {SEASONAL_THEMES} from '../core/seasonalCatalog';
import {CosmeticPreview} from '../components/CosmeticPreview';
import {ShopDialog} from '../components/ShopDialog';
const tabs=[['theme','Tema'],['tile','Paket tile'],['block','Balok'],['card','Kartu'],['profile','Profil'],['animation','Animasi'],['effect','Kemenangan'],['help','Bantuan']];
const helpNames:any={hint:['Petunjuk','Satu pasangan Onet yang bisa dihubungkan.'],shuffle:['Acak / Tukar','Acak Onet atau tukar tiga pilihan balok.'],hammer:['Palu','Hapus satu balok penghalang.'],bomb:['Bom','Kosongkan area 3×3 di Block Puzzle.']};
const slotLabel:any={tileSet:'PAKET 3 UKURAN',arrow:'INDIKATOR ARAH',block:'BALOK',avatar:'AVATAR',frame:'BINGKAI',effect:'EFEK KEMENANGAN',onetAnimation:'ANIMASI ONET',blockAnimation:'ANIMASI BLOCK + INFINITY',memoryAnimation:'ANIMASI MEMORY',memoryCard:'KARTU MEMORY'};
export const ShopScreen=()=>{
  const {profile,updateProfile}=useProfile(),cde=useCDE(),{availableThemes,activeTheme,setTheme}=useTheme(),audio=useAudio();
  const [tab,setTab]=useState('theme'),[ownedOnly,setOwnedOnly]=useState(false),[dialog,setDialog]=useState<any>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const items:any[]=[...Object.entries(ITEM_PRICES).map(([id,price])=>({id,price,name:helpNames[id][0],description:helpNames[id][1],category:'help'})),...Object.values(availableThemes).filter(t=>t.type!=='reward').map(t=>({id:`theme_${t.id}`,themeId:t.id,category:'theme',name:t.name,description:`${Object.keys(t.assets.tiles).length} gambar pasangan untuk Onet, Memory Flip, dan Triple Match.`,images:Object.values(t.assets.tiles).slice(0,3),allImages:Object.values(t.assets.tiles),price:getItemPrice(`theme_${t.id}`)||0,edition:SEASONAL_THEMES.some(s=>s.id===t.id)?'seasonal':'atelier'})),...COSMETICS.filter(item=>!item.reward&&!item.hiddenIndividual)];
  const owned=(item:any)=>item.category==='help'?false:item.category==='theme'?ownsTheme(profile,item.themeId):ownsCosmetic(profile,item.id);
  const equipped=(item:any)=>item.category==='theme'?activeTheme.id===item.themeId:isCosmeticEquipped(profile,item);
  const equip=(item:any,remove=false)=>{if(item.category==='theme'){setTheme(item.themeId);updateProfile({activeTheme:item.themeId});}else updateProfile(cosmeticEquipPatch(profile,item,remove));audio.playUiClick();};
  const buy=async()=>{
    if(!dialog||busy)return;setBusy(true);
    try{await cde.queueMutation('PURCHASE_ITEM',{itemId:dialog.item.id});audio.playSfx('purchase');setMessage(navigator.onLine?'Pembelian dicatat. Pakai item dari katalog di bawah.':'Pembelian menunggu koneksi. Status akan disinkronkan saat online.');setDialog(null);}
    catch(e:any){setMessage(e.message==='INSUFFICIENT_PERMEN'?'Permen belum cukup. Kumpulkan hadiah dari misi dan peti.':'Belum berhasil. Saldo dan kepemilikan akan disinkronkan.');}finally{setBusy(false);}
  };
  const visible=items.filter(item=>(tab==='profile'?['avatar','frame'].includes(item.category):item.category===tab)&&(!ownedOnly||owned(item))).sort((a,b)=>Number(b.edition==='seasonal')-Number(a.edition==='seasonal'));
  return <GameShell title="Toko klub" eyebrow="PILIH GAYA. TETAP JADI DIRIMU." wide>
    <div className="seasonal-shop-hero" data-testid="shop-intro"><div><span className="eyebrow" data-testid="shop-edition-label">BARU · SEASONAL STORIES</span><h2 data-testid="shop-headline">Empat dunia.<br/><em>Banyak cerita.</em></h2><p data-testid="shop-seasonal-copy">Tema baru, paket skin lengkap, dan animasi yang bisa kamu pilih sendiri.</p></div><div className="seasonal-hero-art" aria-hidden="true">{SEASONAL_THEMES.map((t,i)=><img key={t.id} src={`/art/premium/${t.id}/${[1,3,0,12][i]}.webp`} alt=""/>)}</div></div>
    <div className="shop-toolbar"><div className="shop-tabs" aria-label="Kategori toko">{tabs.map(([id,label])=><button key={id} data-testid={`shop-tab-${id}`} aria-pressed={tab===id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMessage('');}}>{label}</button>)}</div><button className={`owned-toggle ${ownedOnly?'active':''}`} data-testid="shop-owned-toggle" aria-pressed={ownedOnly} onClick={()=>setOwnedOnly(!ownedOnly)}><Check size={14}/>Milikku</button></div>
    {tab==='tile'&&<p className="catalog-note" data-testid="skin-pack-policy">Skin selalu satu set: 1×1, domino dua arah, dan 2×2. Sudah punya satu varian lama? Set lengkapnya otomatis menjadi milikmu.</p>}
    {tab==='animation'&&<p className="catalog-note" data-testid="animation-policy">Pratinjau memakai animasi yang sama dengan permainan. Kosmetik tidak mengubah skor, timer, atau kekuatan.</p>}
    {message&&<p className="shop-message" role="status" data-testid="shop-message">{message}</p>}
    <div className="atelier-grid" data-testid="shop-products">{visible.map(item=><article className="atelier-product" key={item.id} data-testid={`shop-product-${item.id}`}>
      <button className="product-preview-button" data-testid={`shop-preview-${item.id}`} aria-label={`Lihat detail ${item.name}`} onClick={()=>setDialog({item,mode:'preview'})}><CosmeticPreview item={item}/><span className="preview-cue"><Eye size={13}/>Lihat detail</span></button>
      <div className="product-copy"><span className="product-kind" data-testid={`product-kind-${item.id}`}>{item.category==='help'?`STOK: ${profile[ITEM_FIELD[item.id]]??3}`:slotLabel[item.slot]||'TEMA PERMAINAN'}</span><h3 data-testid={`product-title-${item.id}`}>{item.name}</h3><span className="art-edition" data-testid={`product-edition-${item.id}`}>{item.price===0?'Bawaan · Gratis':item.category==='help'?'Sekali pakai':item.edition==='seasonal'?'Baru · Seasonal Stories':'Atelier · Permanen'}</span><p data-testid={`product-description-${item.id}`}>{item.description}</p>
      {owned(item)?<>{equipped(item)?<><span className="product-action equipped" data-testid={`shop-equipped-${item.id}`}><Check size={14}/>Dipakai</span>{item.category!=='theme'&&item.price>0&&<button className="text-button remove-cosmetic" data-testid={`shop-remove-${item.id}`} onClick={()=>equip(item,true)}>Lepas {item.members?'set':'item'}</button>}</>:<button className="product-action" data-testid={`shop-equip-${item.id}`} onClick={()=>equip(item)}>{item.members?'Pakai seluruh set':'Pakai'}</button>}</>:<button className="product-action" data-testid={`shop-buy-${item.id}`} onClick={()=>{setDialog({item,mode:'purchase'});setMessage('');}}><Candy size={15}/><b data-testid={`shop-price-${item.id}`}>{item.price}</b><span>Permen</span></button>}</div>
    </article>)}</div>
    {!visible.length&&<div className="empty-state" data-testid="shop-empty"><ShoppingBag size={30}/><p>Belum punya item di kategori ini.</p><button className="pop-button mint" data-testid="shop-show-all" onClick={()=>setOwnedOnly(false)}>Lihat pilihan</button></div>}
    {dialog&&<ShopDialog item={dialog.item} mode={dialog.mode} balance={cde.permen} busy={busy} onClose={()=>setDialog(null)} onBuy={buy}/>}
  </GameShell>;
};