export type BlockShape = number[][];
export interface Piece {id:number|string;shape:BlockShape;colorClass:string;}
export const BLOCK_COLORS=['bg-blue-400','bg-theme-primary-coral-pink','bg-green-400','bg-yellow-400','bg-purple-400','bg-orange-400'];
// Six classic families only: dots, bars, squares, corner, L and T. No U/plus/oversized shapes.
const SHAPES=[
  {id:'dot',shape:[[1]],weight:12},
  {id:'bar2h',shape:[[1,1]],weight:18},{id:'bar2v',shape:[[1],[1]],weight:18},
  {id:'bar3h',shape:[[1,1,1]],weight:20},{id:'bar3v',shape:[[1],[1],[1]],weight:20},
  {id:'bar4h',shape:[[1,1,1,1]],weight:12},{id:'bar4v',shape:[[1],[1],[1],[1]],weight:12},
  {id:'square',shape:[[1,1],[1,1]],weight:22},
  {id:'corner',shape:[[1,0],[1,1]],weight:14},
  {id:'L',shape:[[1,0],[1,0],[1,1]],weight:14},
  {id:'T',shape:[[1,1,1],[0,1,0]],weight:14},
];
let serial=0;
export const ALL_PIECES:Piece[]=SHAPES.flatMap(s=>BLOCK_COLORS.map(colorClass=>({id:`${s.id}-${colorClass}`,shape:s.shape,colorClass})));
export const getRandomPieces=(count:number,board:string[][]|null=null,canPlaceFn:((p:Piece,r:number,c:number,b:string[][],o?:any)=>boolean)|null=null,rigChance=0,obstacles:any=null,rng:()=>number=Math.random,classic=false):Piece[]=>{
  const used=new Set<string>();
  const available=SHAPES.filter(s=>!board||!canPlaceFn||board.some((row,r)=>row.some((_,c)=>canPlaceFn({id:s.id,shape:s.shape,colorClass:BLOCK_COLORS[0]},r,c,board,obstacles))));
  return Array.from({length:count},()=>{
    // Infinity draws honestly from the full classic bag; no guaranteed rescue piece.
    const candidates=(classic?SHAPES:available.length?available:SHAPES);
    let pool=candidates.filter(s=>!used.has(s.id));if(!pool.length)pool=candidates;
    let pick=rng()*pool.reduce((sum,s)=>sum+s.weight,0),index=0;
    while(index<pool.length-1&&pick>=pool[index].weight)pick-=pool[index++].weight;
    const selected=pool[index];used.add(selected.id);
    return {id:`${selected.id}-${++serial}`,shape:selected.shape.map(row=>[...row]),colorClass:BLOCK_COLORS[Math.floor(rng()*BLOCK_COLORS.length)]};
  });
};