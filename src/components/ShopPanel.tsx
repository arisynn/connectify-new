import React,{useState} from 'react';
import {Candy,Check,ShoppingBag,Shirt,Search,ArrowUpRight,Palette} from 'lucide-react';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useTheme} from '../core/theme/ThemeProvider';
import {useAudio} from '../core/audio/AudioEngine';
import {CosmeticPreview} from './CosmeticPreview';
import {ShopDialog} from './ShopDialog';
import {shopCatalog,productOwned,productGames} from '../core/shopCatalog';
import {HubGame,GAME_NAMES} from '../core/games';
import '../simple-club.css';
const tabsFor=(game:HubGame):string[][]=>game==='hub'?[['skin','Profil']]:game==='onet'?[['skin','Skin'],['theme','Tema'],['item','Item']]:game==='star'?[['skin','Pesawat & laser'],['item','Item'],['upgrade','Upgrade']]:[['skin','Skin'],['item','Item']];
const inTab=(item:any,tab:string,game:HubGame)=>tab==='theme'?item.category==='theme':tab==='item'?item.category==='help':tab==='upgrade'?item.category==='upgrade':!['theme','help','upgrade'].includes(item.category)&&(game==='hub'?productGames(item).includes('profile'):true);

// One catalog, split per game: the hub sells profile cosmetics and themes, each game sells its own skins, items and upgrades.
export const ShopPanel=({game}:{game:HubGame})=>{
  const {profile}=useProfile(),cde=useCDE(),{navigate,openGame}=useGame(),{availableThemes}=useTheme(),audio=useAudio(),tabs=tabsFor(game);
  const [tab,setTab]=useState(()=>{const saved=sessionStorage.getItem('shop-tab');sessionStorage.removeItem('shop-tab');return tabs.some(t=>t[0]===saved)?saved!:tabs[0][0];});
  const [search,setSearch]=useState(''),[dialog,setDialog]=useState<any>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const items=shopCatalog(availableThemes,profile).filter(item=>game==='hub'?productGames(item).includes('profile'):item.category==='theme'?game==='onet':productGames(item).includes(game)),owned=(item:any)=>productOwned(item,profile);
  const visible=items.filter(item=>inTab(item,tab,game)&&item.name.toLowerCase().includes(search.toLowerCase().trim()));
  const buy=async()=>{
    if(!dialog||busy)return;setBusy(true);setMessage('');
    try{await cde.commitMutation('PURCHASE_ITEM',{itemId:dialog.item.id});audio.playSfx('purchase');setMessage(dialog.item.category==='upgrade'?'Upgrade tersimpan. Aktif pada ronde berikutnya.':dialog.item.category==='help'?'Item tersimpan di koleksimu.':'Pembelian tersimpan. Pakai dari Koleksi.');setDialog(null);}
    catch(e:any){setMessage(e.message==='INSUFFICIENT_PERMEN'?'Permen belum cukup.':e.message==='SAVE_PENDING'?'Konfirmasi masih menunggu koneksi. Pembelian yang sama tidak akan dikirim dua kali.':e.message==='INVALID_UPGRADE_LEVEL'?'Tingkat upgrade sudah berubah. Buka kembali item.':'Pembelian belum berhasil. Saldo tidak boleh berkurang tanpa item tersimpan.');setDialog(null);}finally{setBusy(false);}
  };
  return <div className="simple-shop" data-testid={`shop-panel-${game}`}>
    <div className="simple-shop-heading"><span data-testid="shop-headline">{game==='hub'?'Gaya profil untuk klubmu.':`Perlengkapan khusus ${GAME_NAMES[game]}.`}</span><button className="owned-toggle" data-testid="shop-open-collection" onClick={()=>navigate('koleksi')}><Shirt size={17}/>Koleksi<ArrowUpRight size={14}/></button></div>
    <div className="simple-shop-tabs" role="tablist" aria-label="Kategori toko">{tabs.map(([id,label])=><button role="tab" aria-selected={tab===id} key={id} data-testid={`shop-tab-${id}`} onClick={()=>{setTab(id);setSearch('');setMessage('');}}>{label}</button>)}</div>
    <div className="simple-shop-filters"><label className="shop-search"><Search size={17}/><input data-testid="shop-search" aria-label="Cari produk" placeholder="Cari di kategori ini…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    {tab==='upgrade'&&<div className="upgrade-heading"><span data-testid="shop-upgrade-note">Infinity · upgrade permanen</span><button className="text-button" data-testid="shop-open-hangar" onClick={()=>navigate('star-hangar')}>Hanggar <ArrowUpRight size={15}/></button></div>}
    {message&&<p className="shop-message" role="status" data-testid="shop-message">{message}</p>}
    <div className="atelier-grid simple-products" data-testid="shop-products">{visible.map(item=><article className="atelier-product" key={item.id} data-testid={`shop-product-${item.id}`}>
      <button className="product-preview-button" data-testid={`shop-preview-${item.id}`} aria-label={`Detail ${item.name}`} onClick={()=>setDialog({item,mode:'preview'})}><CosmeticPreview item={item}/></button>
      <div className="product-copy"><small data-testid={`product-kind-${item.id}`}>{item.category==='theme'?'Tema permainan':item.category==='help'?'Item sekali pakai':item.category==='upgrade'?'Upgrade permanen':'Kosmetik'}</small><h3 data-testid={`product-title-${item.id}`}>{item.name}</h3>
        {item.category==='help'&&<p data-testid={`shop-stock-${item.id}`}>Stok {item.stock} · sekali pakai</p>}
        {item.category==='upgrade'&&<><p data-testid={`shop-upgrade-level-${item.key}`}>Tingkat {item.currentLevel}/3</p><span className="upgrade-pips" data-testid={`shop-upgrade-pips-${item.key}`}>{[1,2,3].map(n=><i key={n} className={n<=item.currentLevel?'filled':''}/>)}</span></>}
        {owned(item)?item.maxed?<span className="product-action equipped" data-testid={`shop-maxed-${item.key}`}><Check size={15}/>Maksimal</span>:<button className="product-action equipped" data-testid={`shop-owned-${item.id}`} onClick={()=>navigate('koleksi')}><Check size={14}/>Dimiliki</button>:<button className="product-action" data-testid={`shop-buy-${item.id}`} onClick={()=>{setDialog({item,mode:'purchase'});setMessage('');}}><Candy size={15}/><b data-testid={`shop-price-${item.id}`}>{item.price}</b><span>{item.category==='upgrade'?'Upgrade':'Beli'}</span></button>}
      </div></article>)}</div>
    {!visible.length&&<div className="empty-state" data-testid="shop-empty"><ShoppingBag size={30}/><p>{search?'Tidak ada produk yang cocok.':`${GAME_NAMES[game]} memakai gambar dari Tema Onet.`}</p>{search?<button className="text-button" data-testid="shop-reset-filters" onClick={()=>setSearch('')}>Reset pencarian</button>:game!=='hub'&&game!=='onet'&&<button className="text-button" data-testid="shop-open-onet-themes" onClick={()=>{sessionStorage.setItem('shop-tab','theme');openGame('onet','toko');}}><Palette size={15}/>Lihat tema di toko Onet</button>}</div>}
    {dialog&&<ShopDialog item={dialog.item} mode={dialog.mode} balance={cde.permen} busy={busy} onClose={()=>setDialog(null)} onBuy={buy}/>}
  </div>;
};
