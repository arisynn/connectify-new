export type StarPhase='ready'|'playing'|'paused'|'over';
export interface StarState {phase:StarPhase;score:number;kills:number;wave:number;bosses:number;hp:number;maxHp:number;time:number;bossHp:number;bossMax:number;won:boolean;shield:boolean;ready:boolean;error?:string}
export interface StarConfig {level:number;hull:number;cannon:number;recovery:number;ship:string;laser:string;onState:(state:StarState)=>void;onSound:(key:string)=>void}
export const initialStarState=(hp=5):StarState=>({phase:'ready',score:0,kills:0,wave:1,bosses:0,hp,maxHp:hp,time:0,bossHp:0,bossMax:0,won:false,shield:false,ready:false});
export const STAR_WIDTH=480,STAR_HEIGHT=680;