import React,{useState} from 'react';
import {Candy,Check,ShoppingBag,Shirt,Search,ArrowUpRight} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useTheme} from '../core/theme/ThemeProvider';
import {useAudio} from '../core/audio/AudioEngine';
import {CosmeticPreview} from '../components/CosmeticPreview';
import {ShopDialog} from '../components/ShopDialog';
import {shopCatalog,productOwned,productGame} from '../core/shopCatalog';
import '../simple-club.css';
const tabs=[['skin','Skin'],['theme','Tema'],['item','Item'],['upgrade','Upgrade']];
const gameNames:any={star:'Star Patrol',onet:'Onet',block:'Block Puzzle',memory:'Memory Flip',profile:'Profil',all:'Semua game'};
export const ShopScreen=()=>{
  const {profile}=useProfile(),cde=useCDE(),{navigate}=useGame(),{availableThemes}=useTheme(),audio=useAudio();
  const [tab,setTab]=useState(()=>{const saved=sessionStorage.getItem('shop-tab');return tabs.some(t=>t[0]===saved)?saved!:'skin';});
  const [filter,setFilter]=useState('all'),[search,setSearch]=useState(''),[dialog,setDialog]=useState<any>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const items=shopCatalog(availableThemes,profile),owned=(item:any)=>productOwned(item,profile);
  const visible=items.filter(item=>(tab==='skin'?!['theme','help','upgrade'].includes(item.category):item.category===(tab==='item'?'help':tab))&&(filter==='all'||productGame(item)===filter)&&item.name.toLowerCase().includes(search.toLowerCase().trim()));
  const buy=async()=>{
    if(!dialog||busy)return;setBusy(true);setMessage('');
    try{await cde.commitMutation('PURCHASE_ITEM',{itemId:dialog.item.id});audio.playSfx('purchase');setMessage(dialog.item.category==='upgrade'?'Upgrade tersimpan. Aktif pada ronde berikutnya.':dialog.item.category==='help'?'Item tersimpan di koleksimu.':'Pembelian tersimpan. Pakai skin dari Koleksi.');setDialog(null);}
    catch(e:any){setMessage(e.message==='INSUFFICIENT_PERMEN'?'Permen belum cukup.':e.message==='SAVE_PENDING'?'Konfirmasi masih menunggu koneksi. Pembelian yang sama tidak akan dikirim dua kali.':e.message==='INVALID_UPGRADE_LEVEL'?'Tingkat upgrade sudah berubah. Buka kembali item.':'Pembelian belum berhasil. Saldo tidak boleh berkurang tanpa item tersimpan.');setDialog(null);}finally{setBusy(false);}
  };
  const changeTab=(id:string)=>{setTab(id);sessionStorage.setItem('shop-tab',id);setFilter('all');setSearch('');setMessage('');};
  return <GameShell title="Toko" eyebrow="CONNECTIFY CLUB" wide><div className="simple-shop" data-testid="simple-shop">
    <div className="simple-shop-heading"><span data-testid="shop-headline">Sedikit gaya, lebih seru.</span><button className="owned-toggle" data-testid="shop-open-collection" onClick={()=>navigate('koleksi')}><Shirt size={17}/>Koleksi<ArrowUpRight size={14}/></button></div>
    <div className="simple-shop-tabs" role="tablist" aria-label="Kategori toko">{tabs.map(([id,label])=><button role="tab" aria-selected={tab===id} key={id} data-testid={`shop-tab-${id}`} onClick={()=>changeTab(id)}>{label}</button>)}</div>
    <div className="simple-shop-filters"><label className="shop-search"><Search size={17}/><input data-testid="shop-search" aria-label="Cari produk" placeholder="Cari di kategori ini…" value={search} onChange={e=>setSearch(e.target.value)}/></label>{['skin','item'].includes(tab)&&<select aria-label="Filter permainan" data-testid="shop-game-filter" value={filter} onChange={e=>setFilter(e.target.value)}>{Object.entries(gameNames).map(([id,name])=><option key={id} value={id}>{String(name)}</option>)}</select>}</div>
    {tab==='upgrade'&&<div className="upgrade-heading"><span data-testid="shop-upgrade-note">Star Patrol · upgrade permanen</span><button className="text-button" data-testid="shop-open-hangar" onClick={()=>navigate('star-hangar')}>Hanggar <ArrowUpRight size={15}/></button></div>}
    {message&&<p className="shop-message" role="status" data-testid="shop-message">{message}</p>}
    <div className="atelier-grid simple-products" data-testid="shop-products">{visible.map(item=><article className="atelier-product" key={item.id} data-testid={`shop-product-${item.id}`}>
      <button className="product-preview-button" data-testid={`shop-preview-${item.id}`} aria-label={`Detail ${item.name}`} onClick={()=>setDialog({item,mode:'preview'})}><CosmeticPreview item={item}/></button>
      <div className="product-copy"><small data-testid={`product-kind-${item.id}`}>{item.category==='theme'?'Tema permainan':gameNames[productGame(item)]}</small><h3 data-testid={`product-title-${item.id}`}>{item.name}</h3>
        {item.category==='help'&&<p data-testid={`shop-stock-${item.id}`}>Stok {item.stock} · sekali pakai</p>}
        {item.category==='upgrade'&&<><p data-testid={`shop-upgrade-level-${item.key}`}>Tingkat {item.currentLevel}/3</p><span className="upgrade-pips" data-testid={`shop-upgrade-pips-${item.key}`}>{[1,2,3].map(n=><i key={n} className={n<=item.currentLevel?'filled':''}/>)}</span></>}
        {owned(item)?item.maxed?<span className="product-action equipped" data-testid={`shop-maxed-${item.key}`}><Check size={15}/>Maksimal</span>:<button className="product-action equipped" data-testid={`shop-owned-${item.id}`} onClick={()=>navigate('koleksi')}><Check size={14}/>Dimiliki</button>:<button className="product-action" data-testid={`shop-buy-${item.id}`} onClick={()=>{setDialog({item,mode:'purchase'});setMessage('');}}><Candy size={15}/><b data-testid={`shop-price-${item.id}`}>{item.price}</b><span>{item.category==='upgrade'?'Upgrade':'Beli'}</span></button>}
      </div></article>)}</div>
    {!visible.length&&<div className="empty-state" data-testid="shop-empty"><ShoppingBag size={30}/><p>Tidak ada produk yang cocok.</p><button className="text-button" data-testid="shop-reset-filters" onClick={()=>{setSearch('');setFilter('all');}}>Reset pencarian</button></div>}
    {dialog&&<ShopDialog item={dialog.item} mode={dialog.mode} balance={cde.permen} busy={busy} onClose={()=>setDialog(null)} onBuy={buy}/>}
  </div></GameShell>;
};