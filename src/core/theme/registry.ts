import { ThemeManifest } from './types';
import { vanillaTheme } from './utils';
import { TILE_SETS } from '../tileCatalog';
import { THEME_PRICES } from '../economy';
import { ART_REWARDS } from '../artRewards';
import { SEASONAL_THEMES } from '../seasonalCatalog';

const makeTheme=(id:string,name:string,bg:string,accent:string):ThemeManifest=>({
  id,name,type:'standar',price:THEME_PRICES[id],currency:'coins',data:TILE_SETS[id],
  colors:{'bg-main':bg,'primary-coral-pink':accent,'border-main':'#172337','text-primary':'#172337','primary':accent,'bg':bg},
  assets:{logo:{},tiles:Object.fromEntries(TILE_SETS[id].map((key:string,i:number)=>[key,`/art/${id}/${i}.webp`])),backgrounds:{global:'',popup:''}}
});
export const DEFAULT_THEMES:Record<string,ThemeManifest>={
  sweets:{...vanillaTheme,name:'Summer Club'},
  meadow:{...makeTheme('meadow','Meadow Atelier','#eff7ee','#8abb8c'),assets:{logo:{},tiles:Object.fromEntries(TILE_SETS.meadow.map((key:string,i:number)=>[key,`/art/premium/meadow/${i}.webp`])),backgrounds:{}}},
  ocean:makeTheme('ocean','Ocean Friends','#edf9fc','#39c6c8'),
  forest:makeTheme('forest','Forest Tales','#f1f7ed','#81c787'),
  candy:makeTheme('candy','Candy Parade','#fff0f4','#ff8fba'),
  space:makeTheme('space','Cosmic Trip','#edf0fb','#8cbbff')
};
for (const [id,name,bg,accent] of [
  ['sakura','Sakura Atelier','#fff1f4','#db91a6'], ['bakery','Petite Bakery','#fff6e8','#d5a567'],
  ['galaxy','Midnight Galaxy','#edf2fc','#8faee0'], ['fruit','Fruit Market','#f3fae9','#99bd69']
]) {
  DEFAULT_THEMES[id] = {...makeTheme(id,name,bg,accent),type:'premium',assets:{logo:{},tiles:Object.fromEntries(TILE_SETS[id].map((key:string,i:number)=>[key,`/art/premium/${id}/${i}.webp`])),backgrounds:{}}};
}
for (const [id,name] of [['sakura','Sakura'],['bakery','Bakery'],['galaxy','Galaxy'],['meadow','Meadow'],['fruit','Fruit']]) {
  const key = `reward_${id}`;
  DEFAULT_THEMES[key] = { ...makeTheme(key,`${name} · Edisi Hadiah`,'#f4f5f0','#9abbaa'),type:'reward',price:undefined,reward:ART_REWARDS[key],
    assets:{logo:{},tiles:Object.fromEntries(TILE_SETS[key].map((tile:string,i:number)=>[tile,`/art/${id}/${i}.webp`])),backgrounds:{}} };
}
for (const {id,name,bg,accent} of SEASONAL_THEMES) {
  DEFAULT_THEMES[id] = {...makeTheme(id,name,bg,accent),type:'premium',assets:{logo:{},tiles:Object.fromEntries(TILE_SETS[id].map((key:string,i:number)=>[key,`/art/premium/${id}/${i}.webp`])),backgrounds:{}}};
}