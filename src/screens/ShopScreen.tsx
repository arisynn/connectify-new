import React,{useState} from 'react';
import {Candy,Check,ShoppingBag,X} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useTheme} from '../core/theme/ThemeProvider';
import {useAudio} from '../core/audio/AudioEngine';
import {COSMETICS,ownsCosmetic,equippedCosmetic} from '../core/cosmetics';
import {ownsTheme} from '../core/artRewards';
import {ITEM_PRICES,ITEM_FIELD,getItemPrice} from '../core/economy';
import {CosmeticPreview} from '../components/CosmeticPreview';
import {TileGallery} from '../components/TileGallery';
const tabs=[['help','Bantuan'],['theme','Tema'],['tile','Tile'],['block','Balok'],['profile','Profil'],['effect','Efek']];
const helpNames:any={hint:['Petunjuk','Satu pasangan Onet yang bisa dihubungkan.'],shuffle:['Acak / Tukar','Acak Onet atau tukar tiga pilihan balok.'],hammer:['Palu','Hapus satu balok penghalang.'],bomb:['Bom','Kosongkan area 3×3 di Block Puzzle.']};
const slotLabel:any={tile1:'TILE 1×1',tile2:'DOMINO',tile4:'TILE 2×2',arrow:'INDIKATOR ARAH',block:'BALOK',avatar:'AVATAR',frame:'BINGKAI',effect:'EFEK MENANG'};
export const ShopScreen=()=>{
  const {profile,updateProfile}=useProfile(),cde=useCDE(),{availableThemes,activeTheme,setTheme}=useTheme(),audio=useAudio();
  const [tab,setTab]=useState('theme'),[ownedOnly,setOwnedOnly]=useState(false),[purchase,setPurchase]=useState<any>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const items:any[]=[...Object.entries(ITEM_PRICES).map(([id,price])=>({id,price,name:helpNames[id][0],description:helpNames[id][1],category:'help'})),...Object.values(availableThemes).filter(t=>t.type!=='reward').map(t=>({id:`theme_${t.id}`,themeId:t.id,category:'theme',name:t.name,description:`${Object.keys(t.assets.tiles).length} gambar pasangan. Skin bingkai terpisah.`,images:Object.values(t.assets.tiles).slice(0,3),price:getItemPrice(`theme_${t.id}`)||0,classic:['ocean','forest','candy','space'].includes(t.id)})),...COSMETICS.filter(item=>!item.reward)];
  const owned=(item:any)=>item.category==='help'?(profile[ITEM_FIELD[item.id]]??3)>0:item.category==='theme'?ownsTheme(profile,item.themeId):ownsCosmetic(profile,item.id);
  const equipped=(item:any)=>item.category==='theme'?activeTheme.id===item.themeId:equippedCosmetic(profile,item.slot)?.id===item.id;
  const equip=(item:any)=>{if(item.category==='theme'){setTheme(item.themeId);updateProfile({activeTheme:item.themeId});}else updateProfile({equippedCosmetics:{...profile.equippedCosmetics,[item.slot]:equipped(item)?null:item.id}});audio.playSfx('purchase');};
  const buy=async()=>{
    if(!purchase||busy)return;setBusy(true);
    try{await cde.queueMutation('PURCHASE_ITEM',{itemId:purchase.id});audio.playSfx('purchase');setMessage(navigator.onLine?'Pembelian dicatat. Item siap dipakai; sinkronisasi berjalan.':'Pembelian menunggu sinkronisasi saat online.');setPurchase(null);}
    catch(e:any){setMessage(e.message==='INSUFFICIENT_PERMEN'?'Permen belum cukup. Kumpulkan hadiah dari misi dan peti.':'Belum berhasil. Saldo dan kepemilikan akan disinkronkan.');}finally{setBusy(false);}
  };
  const visible=items.filter(item=>(tab==='profile'?['avatar','frame'].includes(item.category):item.category===tab)&&(!ownedOnly||owned(item)));
  return <GameShell title="Toko klub" eyebrow="THE ATELIER COLLECTION" wide>
    <div className="atelier-intro" data-testid="shop-intro"><div><span className="eyebrow">EDISI ATELIER</span><h2>Detail kecil.<br/><em>Gaya kamu.</em></h2><p>Teman baru, warna baru.<br/>Pilih yang paling kamu suka.</p></div><img data-testid="shop-mascot" src="/art/premium/avatars/orbit.webp" alt="Orbit"/></div>
    <div className="shop-toolbar"><div className="shop-tabs" aria-label="Kategori toko">{tabs.map(([id,label])=><button key={id} data-testid={`shop-tab-${id}`} aria-pressed={tab===id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMessage('');}}>{label}</button>)}</div><button className={`owned-toggle ${ownedOnly?'active':''}`} data-testid="shop-owned-toggle" aria-pressed={ownedOnly} onClick={()=>setOwnedOnly(!ownedOnly)}><Check size={14}/>Milikku</button></div>
    {message&&<p className="shop-message" role="status" data-testid="shop-message">{message}</p>}
    <div className="atelier-grid" data-testid="shop-products">{visible.map(item=><article className="atelier-product" key={item.id} data-testid={`shop-product-${item.id}`}><CosmeticPreview item={item}/><div className="product-copy">
      <span className="product-kind" data-testid={`product-kind-${item.id}`}>{item.category==='help'?`STOK: ${profile[ITEM_FIELD[item.id]]??3}`:slotLabel[item.slot]||'TEMA ONET'}</span>
      <h3 data-testid={`product-title-${item.id}`}>{item.name}</h3><span className="art-edition" data-testid={`product-edition-${item.id}`}>{item.price===0?'Bawaan · Gratis':item.category==='help'?'Sekali pakai':item.classic?'Koleksi klasik':'Edisi Atelier · Permanen'}</span><p data-testid={`product-description-${item.id}`}>{item.description}</p>
      {owned(item)&&item.category!=='help'?<button className={`product-action ${equipped(item)?'equipped':''}`} data-testid={`shop-equip-${item.id}`} disabled={equipped(item)&&(item.category==='theme'||item.price===0)} onClick={()=>equip(item)}>{equipped(item)?<><Check size={14}/>{item.category==='theme'||item.price===0?'Dipakai':'Dipakai · Lepas'}</>:'Pakai'}</button>:<button className="product-action" data-testid={`shop-buy-${item.id}`} onClick={()=>{setPurchase(item);setMessage('');}}><Candy size={15}/><b data-testid={`shop-price-${item.id}`}>{item.price}</b><span>Permen</span></button>}</div></article>)}</div>
    {!visible.length&&<div className="empty-state" data-testid="shop-empty"><ShoppingBag size={30}/><p>Belum punya item di kategori ini.</p><button className="pop-button mint" data-testid="shop-show-all" onClick={()=>setOwnedOnly(false)}>Lihat pilihan</button></div>}
    {tab==='theme'&&<TileGallery/>}
    {purchase&&<div className="dialog-backdrop"><section className="result-card purchase-card" role="dialog" aria-modal="true" aria-labelledby="purchase-title" data-testid="purchase-dialog"><button data-testid="purchase-close" className="round-button purchase-close" aria-label="Tutup" disabled={busy} onClick={()=>setPurchase(null)}><X size={17}/></button><CosmeticPreview item={purchase} context="purchase"/><h2 id="purchase-title" data-testid="purchase-title">{purchase.name}</h2><p data-testid="purchase-description">{purchase.category==='help'?'Tambah 1 bantuan ke inventori.':'Pembelian permanen, bukan sewa.'} Saldo sekarang: {cde.permen} Permen.</p><button autoFocus className="pop-button mint" data-testid="purchase-confirm" disabled={busy||cde.permen<purchase.price} onClick={buy}>{busy?'Mencatat…':`Beli · ${purchase.price} Permen`}</button>{cde.permen<purchase.price&&<p data-testid="purchase-insufficient">Permen belum cukup.</p>}<button className="text-button" data-testid="purchase-cancel" disabled={busy} onClick={()=>setPurchase(null)}>Nanti dulu</button></section></div>}
  </GameShell>;
};