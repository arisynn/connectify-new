import React,{useState} from 'react';
import {Candy,Check,ShoppingBag,X} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useTheme} from '../core/theme/ThemeProvider';
import {useAudio} from '../core/audio/AudioEngine';
import {COSMETICS,ownsCosmetic} from '../core/cosmetics';
import {ITEM_PRICES,ITEM_FIELD,getItemPrice} from '../core/economy';
import {CosmeticPreview} from '../components/CosmeticPreview';
import {TileGallery} from '../components/TileGallery';
const tabs=[['help','Bantuan'],['theme','Tema'],['tile','Tile'],['block','Balok'],['profile','Profil'],['effect','Efek']];
const helpNames:any={hint:['Petunjuk','Tunjukkan satu pasangan Onet yang bisa dihubungkan.'],shuffle:['Acak / Tukar','Acak Onet atau tukar tiga pilihan balok.'],hammer:['Palu','Hapus satu balok penghalang.'],bomb:['Bom','Kosongkan area 3×3 di Block Puzzle.']};
export const ShopScreen=()=>{
  const {profile,updateProfile}=useProfile(),cde=useCDE(),{availableThemes,activeTheme,setTheme}=useTheme(),audio=useAudio();
  const [tab,setTab]=useState('help'),[ownedOnly,setOwnedOnly]=useState(false),[purchase,setPurchase]=useState<any>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const items:any[]=[...Object.entries(ITEM_PRICES).map(([id,price])=>({id,price,name:helpNames[id][0],description:helpNames[id][1],category:'help'})),...Object.values(availableThemes).map(t=>({id:`theme_${t.id}`,themeId:t.id,category:'theme',name:t.name,description:'Satu set gambar Onet lengkap. Tidak termasuk skin bingkai tile.',images:Object.values(t.assets.tiles).slice(0,3),price:getItemPrice(`theme_${t.id}`)||0})),...COSMETICS];
  const owned=(item:any)=>item.category==='help'?(profile[ITEM_FIELD[item.id]]??3)>0:item.category==='theme'?['sweets',...(profile.unlockedThemes||[])].includes(item.themeId):ownsCosmetic(profile,item.id);
  const equipped=(item:any)=>item.category==='theme'?activeTheme.id===item.themeId:profile.equippedCosmetics?.[item.slot]===item.id;
  const equip=(item:any)=>{if(item.category==='theme'){setTheme(item.themeId);updateProfile({activeTheme:item.themeId});}else updateProfile({equippedCosmetics:{...profile.equippedCosmetics,[item.slot]:equipped(item)?null:item.id}});audio.playSfx('purchase');};
  const buy=async()=>{
    if(!purchase||busy)return;setBusy(true);
    try{if(cde.permen<purchase.price)throw new Error('INSUFFICIENT_PERMEN');await cde.queueMutation('PURCHASE_ITEM',{itemId:purchase.id});audio.playSfx('purchase');setMessage(navigator.onLine?'Pembelian dicatat. Item milikmu, siap dipakai.':'Pembelian menunggu sinkronisasi saat online.');setPurchase(null);}
    catch(e:any){setMessage(e.message==='INSUFFICIENT_PERMEN'?'Permen belum cukup. Kumpulkan hadiah dari misi dan peti.':'Belum berhasil. Saldo dan kepemilikan akan disinkronkan.');}finally{setBusy(false);}
  };
  const visible=items.filter(item=>(tab==='profile'?['avatar','frame'].includes(item.category):item.category===tab)&&(!ownedOnly||owned(item)));
  return <GameShell title="Toko klub" eyebrow="LITTLE THINGS, YOUR STYLE" wide>
    <div className="atelier-intro" data-testid="shop-intro"><div><span className="eyebrow">BUAT TERASA MILIKMU</span><h2>Detail kecil.<br/><em>Gaya kamu.</em></h2><p>Skin dibeli sekali, dipakai selamanya.<br/>Mekanik tetap sama. Tanpa pay-to-win.</p></div><img src="/art/atelier/orbit.svg" alt="Orbit, avatar toko"/></div>
    <div className="shop-toolbar"><div className="shop-tabs" aria-label="Kategori toko">{tabs.map(([id,label])=><button key={id} data-testid={`shop-tab-${id}`} aria-pressed={tab===id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMessage('');}}>{label}</button>)}</div><button className={`owned-toggle ${ownedOnly?'active':''}`} data-testid="shop-owned-toggle" aria-pressed={ownedOnly} onClick={()=>setOwnedOnly(!ownedOnly)}><Check size={14}/>Milikku</button></div>
    {message&&<p className="shop-message" role="status" data-testid="shop-message">{message}</p>}
    <div className="atelier-grid" data-testid="shop-products">{visible.map(item=><article className="atelier-product" key={item.id} data-testid={`shop-product-${item.id}`}><CosmeticPreview item={item}/><div className="product-copy"><span className="product-kind" data-testid={`product-kind-${item.id}`}>{item.category==='help'?`Stok: ${profile[ITEM_FIELD[item.id]]??3}`:item.slot==='tile4'?'KHUSUS 2×2':item.slot==='tile2'?'KHUSUS DOMINO':item.slot==='arrow'?'TILE ARAH':'MILIKMU SELAMANYA'}</span><h3 data-testid={`product-title-${item.id}`}>{item.name}</h3><p data-testid={`product-description-${item.id}`}>{item.description}</p>
      {owned(item)&&item.category!=='help'?<button className={`product-action ${equipped(item)?'equipped':''}`} data-testid={`shop-equip-${item.id}`} disabled={item.category==='theme'&&equipped(item)} onClick={()=>equip(item)}>{equipped(item)?<><Check size={14}/>{item.category==='theme'?'Dipakai':'Dipakai · Lepas'}</>:'Pakai'}</button>:<button className="product-action" data-testid={`shop-buy-${item.id}`} onClick={()=>{setPurchase(item);setMessage('');}}><Candy size={15}/>{item.price}<span>Permen</span></button>}</div></article>)}</div>
    {!visible.length&&<div className="empty-state" data-testid="shop-empty"><ShoppingBag size={30}/><p>Belum punya item di kategori ini.</p><button className="pop-button mint" data-testid="shop-show-all" onClick={()=>setOwnedOnly(false)}>Lihat pilihan</button></div>}
    {tab==='theme'&&<TileGallery/>}
    {purchase&&<div className="dialog-backdrop"><section className="result-card purchase-card" role="dialog" aria-modal="true" aria-labelledby="purchase-title" data-testid="purchase-dialog"><button data-testid="purchase-close" className="round-button purchase-close" aria-label="Tutup" disabled={busy} onClick={()=>setPurchase(null)}><X size={17}/></button><CosmeticPreview item={purchase}/><h2 id="purchase-title" data-testid="purchase-title">{purchase.name}</h2><p data-testid="purchase-description">{purchase.category==='help'?'Tambah 1 bantuan ke inventori.':'Pembelian permanen, bukan sewa.'} Saldo sekarang: {cde.permen} Permen.</p><button autoFocus className="pop-button mint" data-testid="purchase-confirm" disabled={busy||cde.permen<purchase.price} onClick={buy}>{busy?'Mencatat…':`Beli · ${purchase.price} Permen`}</button>{cde.permen<purchase.price&&<p data-testid="purchase-insufficient">Permen belum cukup.</p>}<button className="text-button" data-testid="purchase-cancel" disabled={busy} onClick={()=>setPurchase(null)}>Nanti dulu</button></section></div>}
  </GameShell>;
};