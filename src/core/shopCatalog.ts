import {COSMETICS,ownsCosmetic} from './cosmetics';
import {ITEM_PRICES,ITEM_FIELD,getItemPrice} from './economy';
import {STAR_UPGRADES,STAR_UPGRADE_ITEMS,starUpgradeLevel} from './starPatrol';
import {ownsTheme} from './artRewards';
const names:any={hint:['Petunjuk','Satu pasangan Onet yang dapat dihubungkan.','onet'],shuffle:['Acak / Tukar','Acak tile Onet atau tukar pilihan balok.','onet'],hammer:['Palu','Hapus satu balok penghalang.','block'],bomb:['Bom','Kosongkan area 3×3 di Block Puzzle.','block'],star_shield:['Perisai','Kebal selama 5 detik di Infinity.','star'],star_blast:['Nova Blast','Hancurkan musuh biasa dan beri 8 damage ke boss.','star']};
export const productGame=(item:any)=>item.game||(item.slot?.startsWith('star')?'star':['tile','block','card'].includes(item.category)?({tile:'onet',block:'block',card:'memory'} as any)[item.category]:item.slot?.startsWith('onet')?'onet':item.slot?.startsWith('block')?'block':item.slot?.startsWith('memory')?'memory':['avatar','frame'].includes(item.category)?'profile':'all');
export const shopCatalog=(themes:any,profile:any):any[]=>[
  ...COSMETICS.filter(c=>!c.reward&&!c.hiddenIndividual&&c.price>0).sort((a,b)=>Number(b.slot?.startsWith('star'))-Number(a.slot?.startsWith('star'))),
  ...Object.values(themes).filter((t:any)=>t.type!=='reward').map((t:any)=>({id:`theme_${t.id}`,themeId:t.id,category:'theme',name:t.name,description:`${Object.keys(t.assets.tiles).length} gambar untuk Onet, Memory, dan Triple Match.`,images:Object.values(t.assets.tiles).slice(0,3),allImages:Object.values(t.assets.tiles),price:getItemPrice(`theme_${t.id}`)||0})),
  ...Object.entries(ITEM_PRICES).map(([id,price])=>({id,price,name:names[id][0],description:names[id][1],game:names[id][2],category:'help',stock:profile[ITEM_FIELD[id]]??3})),
  ...STAR_UPGRADES.map(u=>{const level=starUpgradeLevel(profile,u.key);return {...STAR_UPGRADE_ITEMS.find(i=>i.key===u.key&&i.level===Math.min(3,level+1)),currentLevel:level,maxed:level===3,game:'star'};}),
];
export const productOwned=(item:any,profile:any)=>item.category==='upgrade'?item.maxed:item.category==='help'?false:item.category==='theme'?ownsTheme(profile,item.themeId):ownsCosmetic(profile,item.id);// Games where a product is sold. Consumables shared by two games appear in both.
export const productGames=(item:any):string[]=>item.id==='shuffle'?['onet','block']:[productGame(item)];
