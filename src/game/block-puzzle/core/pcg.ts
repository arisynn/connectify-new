import type { LevelConfig, Mission, ObstacleType } from './levelConfig';
import type { DDABracket } from './dda';
import { seededRandom } from '../../../core/random';

// Bounded constructive PCG: no synchronous multi-second bot simulations on phones.
// Seed + level + skill bracket define the entire board, without localStorage dependence.
export function generateProceduralLevel(level: number, bracket: DDABracket, seedStr: string): LevelConfig {
  const rng=seededRandom(`block-v3:${level}:${bracket}:${seedStr}`);
  const recovery=level%5===1;
  const factor=bracket==='pity'?.5:bracket==='easy'?.75:bracket==='hard'?1.15:1;
  const budget=Math.max(4,Math.min(24,Math.round((8+Math.floor(level/8))*factor*(recovery?.7:1))));
  const chapter=Math.floor((level-21)/5)%4;
  const mainType:Mission['type']=(['clear_lines','destroy_wood','destroy_ice','destroy_gems'] as const)[((chapter%4)+4)%4];
  const targetObstacle:ObstacleType=mainType==='destroy_wood'?'wood':mainType==='destroy_ice'?'ice':mainType==='destroy_gems'?'gem':'';
  const obstacles:LevelConfig['obstacles']=[];
  const occupied=new Set<string>(),rowCounts=Array(10).fill(0),colCounts=Array(10).fill(0);
  const safeR=2+Math.floor(rng()*4),safeC=2+Math.floor(rng()*4);
  const options:ObstacleType[]=level>35?['wood','ice','gem','metal-1','metal-2','stone']:['wood','ice','gem'];
  const positions=Array.from({length:100},(_,i)=>i);
  for(let i=99;i>0;i--){const j=Math.floor(rng()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
  for(const pos of positions){
    if(obstacles.length>=budget)break;
    const r=Math.floor(pos/10),c=pos%10;
    // Keep a 3×3 landing zone and breathing room on every row and column.
    if((r>=safeR&&r<safeR+3&&c>=safeC&&c<safeC+3)||rowCounts[r]>=3||colCounts[c]>=3)continue;
    const type=targetObstacle&&obstacles.length<Math.ceil(budget*.55)?targetObstacle:options[Math.floor(rng()*options.length)];
    if(occupied.has(`${r}:${c}`))continue;
    obstacles.push({r,c,type});occupied.add(`${r}:${c}`);rowCounts[r]++;colCounts[c]++;
  }
  const available=obstacles.filter(o=>o.type===targetObstacle).length;
  const target=targetObstacle?Math.max(1,Math.ceil(available*.7)):Math.max(2,Math.min(8,Math.round((3+level/25)*factor)));
  const descriptions={clear_lines:`Bersihkan ${target} baris / kolom`,destroy_wood:`Hancurkan ${target} kayu`,destroy_ice:`Cairkan ${target} es`,destroy_gems:`Kumpulkan ${target} permata`};
  return {level,obstacles,gravity:!recovery&&level%3===0,missions:[
    {type:mainType,target,description:descriptions[mainType]},
    {type:'score',target:400+target*100,description:`Raih ${400+target*100} skor`},
    {type:'max_moves',target:30+target*8,description:`Selesai dalam ${30+target*8} langkah`},
  ]};
}