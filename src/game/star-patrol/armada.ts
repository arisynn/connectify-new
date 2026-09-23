export const ENEMIES={
  drone:{name:'Scout Drone',hp:1,size:48,speed:105,shot:0,description:'Formasi cepat, jalur lurus.'},
  interceptor:{name:'Interceptor',hp:2,size:57,speed:91,shot:2400,description:'Zig-zag dan tembakan terarah.'},
  cruiser:{name:'Heavy Cruiser',hp:4,size:65,speed:58,shot:2100,description:'Lapis baja, meriam ganda.'},
  wasp:{name:'Jade Wasp',hp:1,size:49,speed:165,shot:0,description:'Menukik diagonal ke arah pilot.'},
  bomber:{name:'Violet Bomber',hp:3,size:65,speed:68,shot:1900,description:'Gerak menyapu, tiga peluru.'},
  guardian:{name:'Rose Guardian',hp:5,size:62,speed:52,shot:2300,description:'Berputar dan menyebar plasma.'},
};
export type EnemyKind=keyof typeof ENEMIES;
export const FORMATIONS=['Formasi V','Barisan Delta','Sayap Kembar','Berlian','Busur Serbu'];
export const formationSlots=(index:number)=>{
  switch(index%5){
    case 0:return [{x:100,y:-28},{x:170,y:-65},{x:240,y:-102},{x:310,y:-65},{x:380,y:-28}];
    case 1:return [65,152,240,328,415].map(x=>({x,y:-35}));
    case 2:return [{x:45,y:-28},{x:108,y:-67},{x:170,y:-106},{x:310,y:-106},{x:372,y:-67},{x:435,y:-28}];
    case 3:return [{x:240,y:-28},{x:160,y:-82},{x:320,y:-82},{x:240,y:-138},{x:80,y:-138},{x:400,y:-138}];
    default:return [{x:70,y:-100},{x:150,y:-58},{x:240,y:-28},{x:330,y:-58},{x:410,y:-100}];
  }
};
const FLEETS:EnemyKind[][]=[
  ['drone','drone','interceptor','wasp'],['interceptor','drone','bomber','wasp'],
  ['cruiser','wasp','interceptor','guardian'],['wasp','wasp','bomber','cruiser'],
  ['bomber','guardian','interceptor','cruiser'],['guardian','bomber','cruiser','wasp'],
];
export const enemyKind=(sector:number,wave:number,spawn:number):EnemyKind=>{
  const fleet=FLEETS[sector];return fleet[spawn%Math.min(4,wave+1)];
};
export interface Shot{x:number;y:number;vx:number;vy:number}
export const aimed=(x:number,y:number,tx:number,ty:number,speed:number):Shot=>{
  const a=Math.atan2(ty-y,tx-x);return {x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed};
};
export const fan=(x:number,y:number,count:number,speed:number,spread:number,offset=0):Shot[]=>Array.from({length:count},(_,i)=>{
  const a=Math.PI/2+(i-(count-1)/2)*spread+offset;return{x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed};
});
export const bossVolley=(kind:number,x:number,y:number,tx:number,ty:number,speed:number,turn:number,enraged:boolean):Shot[]=>{
  const count=enraged?7:5;
  switch(kind){
    case 0:return fan(x,y,count,speed,.22,Math.sin(turn)*.1);
    case 1:return [-48,0,48].map(dx=>aimed(x+dx,y,tx+dx*.3,ty,speed+(enraged?45:15)));
    case 2:return fan(x,y,enraged?10:8,speed,.39,Math.sin(turn*.7)*.65);
    case 3:{const gap=turn%6;return Array.from({length:7},(_,i)=>i).filter(i=>i!==gap&&i!==gap+1).map(i=>({x:40+i*66,y,vx:0,vy:speed}));}
    case 4:{const side=turn%2===0?-60:60;return [...fan(x+side,y,enraged?5:3,speed,.19),aimed(x-side,y,tx,ty,speed+25)];}
    default:return turn%2?fan(x,y,enraged?9:7,speed,.22):[-65,0,65].map(dx=>aimed(x+dx,y,tx+dx,ty,speed+35));
  }
};