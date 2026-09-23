import {getOnetDifficulty} from './difficulty';
export type GameId='onet'|'block'|'memory'|'triple'|'star';
export type HubGame=GameId|'hub';
export const GAME_ORDER:GameId[]=['onet','block','memory','triple','star'];
export const GAME_NAMES:Record<HubGame,string>={onet:'Onet',block:'Block Puzzle',memory:'Memory Flip',triple:'Triple Match',star:'Infinity',hub:'Hub'};
// Result payload game keys map onto one hub game each.
export const gameKeyOf=(game:string):GameId|undefined=>game==='block-infinity'?'block':GAME_ORDER.includes(game as GameId)?game as GameId:undefined;
const fmt=(n:number)=>Number(n||0).toLocaleString('id-ID');
export interface GameMode{id:string;label:string;sub:string;route:string;mode:'normal'|'daily'|'infinity';}
export interface GameMeta{id:GameId;name:string;eyebrow:string;tagline:string;copy:string;art:string;color:string;font:'round'|'bold';palette:Record<string,string>;cover:string[];modes:(p:any)=>GameMode[];status:(p:any)=>string;stats:(p:any)=>[string,string][];}
// Each game page looks like its own site: palette overrides the club tokens, cover is a collage of that game's real art.
const P=(paper:string,card:string,ink:string,line:string,muted:string,accent:string,soft:string)=>({'--club-paper':paper,'--club-card':card,'--club-ink':ink,'--club-line':line,'--club-muted':muted,'--g-accent':accent,'--g-soft':soft});
const art=(folder:string,ids:number[])=>ids.map(i=>`/art/premium/${folder}/${i}.webp`);
export const GAMES:Record<GameId,GameMeta>={
  onet:{id:'onet',name:'Onet',eyebrow:'PASANGKAN · PECAHKAN · BERSIHKAN',tagline:'Dua gambar, satu jalur.',copy:'Pasangkan gambar dengan maksimal dua belokan. Tile besar pecah jadi pasangan baru.',art:'onet',color:'rose',font:'round',palette:P('#fff0f3','#ffffff','#3a1f2b','#3a1f2b','#9a7583','#ff7a9c','#ffd3df'),cover:art('sakura',[0,3,5,8,11,14]),
    modes:p=>[{id:'onet',label:`Lanjut level ${p.highestLevel||1}`,sub:getOnetDifficulty(p.highestLevel||1).label,route:'play',mode:'normal'},{id:'sprint',label:'Onet Sprint',sub:'Papan harian · 90 detik',route:'play',mode:'daily'}],
    status:p=>`LEVEL ${p.highestLevel||1} · ${getOnetDifficulty(p.highestLevel||1).label}`,
    stats:p=>{const s=p.statistics||{};return [['Level tertinggi',fmt(p.highestLevel||1)],['Ronde',fmt(s.onetGames)],['Menang',fmt(s.onetWins)],['Rekor skor',fmt(s.onetHighScore)],['Pasangan',fmt(s.onetMatches)],['Sprint menang',`${fmt(s.sprintWins)} / ${fmt(s.sprintGames)}`]];}},
  block:{id:'block',name:'Block Puzzle',eyebrow:'SUSUN · ISI · BERSIHKAN',tagline:'Ruang selalu ada.',copy:'Susun balok, penuhi baris atau kolom, dan tuntaskan target setiap papan.',art:'block',color:'mint',font:'bold',palette:P('#eefaf2','#ffffff','#14332a','#14332a','#5f8a78','#38c189','#c9f2dd'),cover:['/art/premium/surfaces/jelly.webp','/art/premium/surfaces/wood.webp','/art/premium/surfaces/mint.webp','/art/premium/surfaces/opal.webp','/art/premium/surfaces/night.webp','/art/premium/surfaces/cloud.webp'],
    modes:p=>[{id:'block',label:`Lanjut level ${Math.max(p.blockPuzzleLevel||1,p.highestBlockPuzzleLevel||1)}`,sub:'Mode level',route:'block-puzzle',mode:'normal'},{id:'infinity',label:'Block Infinity',sub:`Rekor ${fmt(p.statistics?.infinityHighScore)}`,route:'block-puzzle',mode:'infinity'}],
    status:p=>`LEVEL ${Math.max(p.blockPuzzleLevel||1,p.highestBlockPuzzleLevel||1)} · REKOR ${fmt(p.statistics?.infinityHighScore)}`,
    stats:p=>{const s=p.statistics||{};return [['Level tertinggi',fmt(Math.max(p.blockPuzzleLevel||1,p.highestBlockPuzzleLevel||1))],['Ronde',fmt(s.blockGames||s.blockPuzzleGames)],['Menang',fmt(s.blockWins)],['Rekor level',fmt(s.blockHighScore||s.blockPuzzleHighScore)],['Rekor Infinity',fmt(s.infinityHighScore)],['Garis bersih',fmt(s.blockLines)]];}},
  memory:{id:'memory',name:'Memory Flip',eyebrow:'INGAT · BALIK · TEMUKAN',tagline:'Pasangan yang pas.',copy:'Ingat cuplikan awal, balik kartu, dan rangkai combo pasangan.',art:'memory',color:'butter',font:'round',palette:P('#fff7e0','#ffffff','#3d2c10','#3d2c10','#9a8250','#f5b53f','#ffe6a7'),cover:['/art/premium/cards/deck.webp','/art/premium/cards/autumn.webp','/art/premium/cards/celestial.webp','/art/premium/cards/arcade.webp','/art/premium/cards/mint.webp','/art/premium/cards/front.webp'],
    modes:()=>[{id:'memory',label:'Main Memory Flip',sub:'3 kesulitan · kartu bergambar',route:'memory',mode:'normal'}],
    status:p=>`${fmt(p.statistics?.memoryWins)} MENANG · REKOR ${fmt(p.statistics?.memoryHighScore)}`,
    stats:p=>{const s=p.statistics||{};return [['Ronde',fmt(s.memoryGames)],['Menang',fmt(s.memoryWins)],['Rekor skor',fmt(s.memoryHighScore)],['Pasangan',fmt(s.memoryMatches)],['Combo terbaik',`×${fmt(s.memoryBestCombo)}`]];}},
  triple:{id:'triple',name:'Triple Match',eyebrow:'PILIH · SUSUN · SATUKAN',tagline:'Tiga jadi seru.',copy:'Pilih tile teratas dan satukan tiga gambar tanpa memenuhi slot.',art:'triple',color:'rose',font:'round',palette:P('#f6efff','#ffffff','#2d1f47','#2d1f47','#7f6f9e','#a77bff','#e4d6ff'),cover:art('bakery',[1,4,7,9,10,12]),
    modes:()=>[{id:'triple',label:'Main Triple Match',sub:'12 trio · 7 slot',route:'triple',mode:'normal'}],
    status:p=>`${fmt(p.statistics?.tripleWins)} MENANG · REKOR ${fmt(p.statistics?.tripleHighScore)}`,
    stats:p=>{const s=p.statistics||{};return [['Ronde',fmt(s.tripleGames)],['Menang',fmt(s.tripleWins)],['Rekor skor',fmt(s.tripleHighScore)],['Trio terbentuk',fmt(s.tripleMatches)]];}},
  star:{id:'star',name:'Infinity',eyebrow:'ENDLESS SPACE SHOOTER',tagline:'Beyond the stars.',copy:'Terbang tanpa batas. Tembus formasi, kalahkan boss, dan pecahkan rekormu.',art:'star-patrol',color:'sky',font:'bold',palette:P('#070d1c','#111b31','#e8f1ff','#3a4d6e','#8ea3c4','#4fd8ff','#15304d'),cover:['/art/infinity/scout.png','/art/infinity/coral.png','/art/infinity/glacier.png','/art/infinity/phantom.png','/art/infinity/mint.png','/art/infinity/solar.png'],
    modes:p=>[{id:'star',label:'Terbang',sub:`Rekor ${fmt(p.statistics?.starHighScore)}`,route:'star-patrol',mode:'normal'},{id:'hangar',label:'Hanggar',sub:'Pesawat & upgrade',route:'star-hangar',mode:'normal'}],
    status:p=>`ANCAMAN ${p.starLevel||1} · REKOR ${fmt(p.statistics?.starHighScore)}`,
    stats:p=>{const s=p.statistics||{};return [['Rekor skor',fmt(s.starHighScore)],['Gelombang terjauh',fmt(s.starBestWave)],['Ronde',fmt(s.starGames)],['Musuh',fmt(s.starKills)],['Boss',fmt(s.starBosses)],['Ancaman tertinggi',fmt(p.starLevel||1)]];}},
};
