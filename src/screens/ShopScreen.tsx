import React,{useState} from 'react';
import {Candy,Check,ShoppingBag,Eye,Shirt} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useTheme} from '../core/theme/ThemeProvider';
import {useAudio} from '../core/audio/AudioEngine';
import {COSMETICS,ownsCosmetic} from '../core/cosmetics';
import {ownsTheme} from '../core/artRewards';
import {ITEM_PRICES,ITEM_FIELD,DEFAULT_ITEM_COUNT,getItemPrice} from '../core/economy';
import {SEASONAL_THEMES} from '../core/seasonalCatalog';
import {CosmeticPreview} from '../components/CosmeticPreview';
import {ShopDialog} from '../components/ShopDialog';
const tabs=[['theme','Tema'],['tile','Paket tile'],['block','Balok'],['basket','Keranjang'],['card','Kartu'],['profile','Profil'],['animation','Animasi'],['effect','Kemenangan'],['help','Bantuan']];
const helpNames:any={hint:['Petunjuk','Satu pasangan Onet yang bisa dihubungkan.'],shuffle:['Acak / Tukar','Acak Onet atau tukar tiga pilihan balok.'],hammer:['Palu','Hapus satu balok penghalang.'],bomb:['Bom','Kosongkan area 3×3 di Block Puzzle.'],fruit_swap:['Tukar Buah','Tukar buah di tangan dengan buah berikutnya di Fruit Merge.'],fruit_pop:['Petik Buah','Ambil semua buah terkecil dari keranjang Fruit Merge.']};
const slotLabel:any={tileSet:'PAKET 3 UKURAN',arrow:'INDIKATOR ARAH',block:'BALOK',avatar:'AVATAR',frame:'BINGKAI',effect:'EFEK KEMENANGAN',onetAnimation:'ANIMASI ONET',blockAnimation:'ANIMASI BLOCK + INFINITY',memoryAnimation:'ANIMASI MEMORY',fruitAnimation:'ANIMASI FRUIT MERGE',memoryCard:'KARTU MEMORY',fruitBasket:'KERANJANG FRUIT MERGE'};
export const ShopScreen=()=>{
  const {profile}=useProfile(),cde=useCDE(),{navigate}=useGame(),{availableThemes}=useTheme(),audio=useAudio();
  const [tab,setTab]=useState('theme'),[dialog,setDialog]=useState<any>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const items:any[]=[...Object.entries(ITEM_PRICES).map(([id,price])=>({id,price,name:helpNames[id][0],description:helpNames[id][1],category:'help',game:id.startsWith('fruit_')?'Fruit Merge':id==='hint'?'Onet':id==='shuffle'?'Onet · Block':'Block Puzzle'})),...Object.values(availableThemes).filter(t=>t.type!=='reward').map(t=>({id:`theme_${t.id}`,themeId:t.id,category:'theme',name:t.name,description:`${Object.keys(t.assets.tiles).length} gambar pasangan untuk Onet, Memory Flip, dan Triple Match.`,images:Object.values(t.assets.tiles).slice(0,3),allImages:Object.values(t.assets.tiles),price:getItemPrice(`theme_${t.id}`)||0,edition:SEASONAL_THEMES.some(s=>s.id===t.id)?'seasonal':'atelier'})),...COSMETICS.filter(item=>!item.reward&&!item.hiddenIndividual&&item.price>0)];
  const owned=(item:any)=>item.category==='help'?false:item.category==='theme'?ownsTheme(profile,item.themeId):ownsCosmetic(profile,item.id);
  const buy=async()=>{
    if(!dialog||busy)return;setBusy(true);
    try{await cde.queueMutation('PURCHASE_ITEM',{itemId:dialog.item.id});audio.playSfx('purchase');setMessage(dialog.item.category==='help'?'Stok bertambah. Pakai langsung di dalam permainan.':navigator.onLine?'Pembelian dicatat. Atur & pakai dari Profil › Lemari koleksi.':'Pembelian menunggu koneksi. Status akan disinkronkan saat online.');setDialog(null);}
    catch(e:any){setMessage(e.message==='INSUFFICIENT_PERMEN'?'Permen belum cukup. Kumpulkan hadiah dari misi dan peti.':'Belum berhasil. Saldo dan kepemilikan akan disinkronkan.');}finally{setBusy(false);}
  };
  const visible=items.filter(item=>(tab==='profile'?['avatar','frame'].includes(item.category):item.category===tab)).sort((a,b)=>Number(owned(a))-Number(owned(b))||Number(b.edition==='seasonal')-Number(a.edition==='seasonal'));
  return <GameShell title="Toko klub" eyebrow="PILIH GAYA. TETAP JADI DIRIMU." wide>
    <div className="seasonal-shop-hero" data-testid="shop-intro"><div><span className="eyebrow" data-testid="shop-edition-label">BARU · FRUIT MERGE</span><h2 data-testid="shop-headline">Keranjang baru.<br/><em>Cerita baru.</em></h2><p data-testid="shop-seasonal-copy">Skin keranjang, animasi gabungan, dan bantuan Fruit Merge kini tersedia. Item yang sudah dimiliki diatur di Lemari koleksi.</p></div><div className="seasonal-hero-art" aria-hidden="true">{[0,5,8,11].map(i=><img key={i} src={`/art/premium/fruit-merge/${i}.webp`} alt=""/>)}</div></div>
    <div className="shop-toolbar"><div className="shop-tabs" aria-label="Kategori toko">{tabs.map(([id,label])=><button key={id} data-testid={`shop-tab-${id}`} aria-pressed={tab===id} className={tab===id?'active':''} onClick={()=>{setTab(id);setMessage('');}}>{label}</button>)}</div><button className="owned-toggle" data-testid="shop-open-collection" onClick={()=>navigate('koleksi')}><Shirt size={14}/>Koleksiku</button></div>
    {tab==='tile'&&<p className="catalog-note" data-testid="skin-pack-policy">Skin selalu satu set: 1×1, domino dua arah, dan 2×2. Sudah punya satu varian lama? Set lengkapnya otomatis menjadi milikmu.</p>}
    {tab==='animation'&&<p className="catalog-note" data-testid="animation-policy">Pratinjau memakai animasi yang sama dengan permainan. Kosmetik tidak mengubah skor, timer, atau kekuatan.</p>}
    {tab==='basket'&&<p className="catalog-note" data-testid="basket-policy">Skin keranjang hanya mengubah dinding keranjang Fruit Merge. Buah, fisika, dan skor tetap sama.</p>}
    {tab==='help'&&<p className="catalog-note" data-testid="help-policy">Bantuan sekali pakai. Stok tersisa bisa dilihat di Lemari koleksi › Bantuan.</p>}
    {message&&<p className="shop-message" role="status" data-testid="shop-message">{message}</p>}
    <div className="atelier-grid" data-testid="shop-products">{visible.map(item=><article className={`atelier-product ${owned(item)?'is-owned':''}`} key={item.id} data-testid={`shop-product-${item.id}`}>
      <button className="product-preview-button" data-testid={`shop-preview-${item.id}`} aria-label={`Lihat detail ${item.name}`} onClick={()=>setDialog({item,mode:'preview'})}><CosmeticPreview item={item}/><span className="preview-cue"><Eye size={13}/>Lihat detail</span></button>
      <div className="product-copy"><span className="product-kind" data-testid={`product-kind-${item.id}`}>{item.category==='help'?`${item.game} · STOK ${profile[ITEM_FIELD[item.id]]??DEFAULT_ITEM_COUNT}`:slotLabel[item.slot]||'TEMA PERMAINAN'}</span><h3 data-testid={`product-title-${item.id}`}>{item.name}</h3><span className="art-edition" data-testid={`product-edition-${item.id}`}>{item.category==='help'?'Sekali pakai':item.edition==='seasonal'?'Baru · Seasonal Stories':'Atelier · Permanen'}</span><p data-testid={`product-description-${item.id}`}>{item.description}</p>
      {owned(item)?<button className="product-action equipped" data-testid={`shop-owned-${item.id}`} onClick={()=>navigate('koleksi')}><Check size={14}/>Dimiliki · atur di Koleksi</button>:<button className="product-action" data-testid={`shop-buy-${item.id}`} onClick={()=>{setDialog({item,mode:'purchase'});setMessage('');}}><Candy size={15}/><b data-testid={`shop-price-${item.id}`}>{item.price}</b><span>Permen</span></button>}</div>
    </article>)}</div>
    {!visible.length&&<div className="empty-state" data-testid="shop-empty"><ShoppingBag size={30}/><p>Belum ada item di kategori ini.</p></div>}
    {dialog&&<ShopDialog item={dialog.item} mode={dialog.mode} balance={cde.permen} busy={busy} onClose={()=>setDialog(null)} onBuy={buy}/>}
  </GameShell>;
};
