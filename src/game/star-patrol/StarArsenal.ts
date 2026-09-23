import Phaser from 'phaser';
import {SHIP_SIGNATURES} from '../../core/starPatrol';
type Sprite=Phaser.Physics.Arcade.Sprite;
export const POWERUPS=[
  {id:'spread',name:'Spread Laser',asset:'power-spread',description:'Tiga jalur laser sekaligus · 8 detik.'},
  {id:'drone',name:'Drone Wingmen',asset:'power-drone',description:'Dua drone, rudal pencari target · 10 detik.'},
  {id:'rapid',name:'Rapid Fire',asset:'power-rapid',description:'Tembakan ganda supercepat · 8 detik.'},
  {id:'heal',name:'Repair Kit',asset:'heal',description:'Pulihkan 1 HP pesawat.'},
  {id:'beam',name:'Piercing Beam',asset:'power-beam',description:'Laser kuat menembus barisan musuh · 8 detik.'},
  {id:'shield',name:'Energy Shield',asset:'power-shield',description:'Kebal serangan selama 5 detik.'},
];
export const ARSENAL_ASSETS=['companion','beam','rapid','missile',...Object.keys(SHIP_SIGNATURES).map(key=>`shot-${key}`),...POWERUPS.map(p=>p.asset)];
export class StarArsenal{
  private weapon='pulse';private until=0;private droneUntil=0;private next=0;private nextDrone=0;private droneArt:Phaser.GameObjects.Image[];private turn=0;private burst=0;private shipKey:string;
  constructor(private scene:Phaser.Scene,private player:Sprite,private bullets:Phaser.Physics.Arcade.Group,private enemies:Phaser.Physics.Arcade.Group,private cannon:number,ship:string,private laser:string,private damage=0,private wingman=0){
    const key=ship.split('/').pop()?.replace('.png','')||'scout';this.shipKey=SHIP_SIGNATURES[key]?key:'scout';
    this.droneArt=[-1,1].map(()=>scene.add.image(0,0,'companion').setDisplaySize(35,35).setDepth(4).setVisible(false));
  }
  collect(kind:string,now:number){if(kind==='drone')this.droneUntil=now+10000+this.wingman*2000;else if(['spread','rapid','beam'].includes(kind)){this.weapon=kind;this.until=now+8000;this.next=now;this.burst=0;}}
  status(now:number){return {weapon:now<this.until?({spread:'Spread Laser',rapid:'Rapid Fire',beam:'Piercing Beam'}[this.weapon]||'Pulse'):SHIP_SIGNATURES[this.shipKey].name,weaponTime:Math.max(0,Math.ceil((this.until-now)/1000)),droneTime:Math.max(0,Math.ceil((this.droneUntil-now)/1000)),boost:now<this.until};}
  private shoot(x:number,y:number,key:string,vx:number,vy:number,now:number,damage=1,piercing=false,homing=false){
    const b=this.bullets.create(x,y,key) as Sprite;
    b.setDisplaySize(key==='beam'?39:key==='missile'?19:29,key==='beam'?132:key==='missile'?29:36).setVelocity(vx,vy).setDepth(3);
    b.body!.setSize(b.width*(key==='missile'?.4:.25),b.height*.85,true);
    b.setData({damage:damage*(1+this.damage*.2),piercing,homing,born:now,hits:new WeakSet()});
    if(key.startsWith('shot-')&&this.laser.includes('laser-green'))b.setTint(0x91ffbb);
    if(key.startsWith('shot-')&&this.laser.includes('laser-red'))b.setTint(0xff9ea9);
    return b;
  }
  private signature(now:number){
    const {x,y}=this.player,key=`shot-${this.shipKey}`,rate=1-this.cannon*.1;
    switch(this.shipKey){
      case 'coral':this.next=now+390*rate;for(const vx of [-165,0,165])this.shoot(x,y-28,key,vx,-640,now,.48);break;
      case 'glacier':this.next=now+430*rate;this.shoot(x,y-40,key,0,-880,now,1.4,true).setDisplaySize(34,86);break;
      case 'phantom':this.burst=(this.burst+1)%3;this.next=now+(this.burst===0?720:70)*rate;this.shoot(x,y-28,key,0,-800,now,1);break;
      case 'mint':this.next=now+320*rate;this.shoot(x,y-28,key,0,-570,now,1,false,true).setDisplaySize(26,26);break;
      case 'solar':this.next=now+310*rate;for(const side of [-1,1])this.shoot(x+side*14,y-28,key,0,-650,now,.55).setData({helix:side,originX:x}).setDisplaySize(23,28);break;
      default:this.next=now+290*rate;for(const dx of [-11,11])this.shoot(x+dx,y-28,key,0,-680,now,.5);
    }
  }
  update(now:number){
    const weapon=now<this.until?this.weapon:'pulse';
    if(now>=this.next){
      this.next=now+({pulse:290,spread:330,rapid:125,beam:610}[weapon]||290)*(1-this.cannon*.1);
      const {x,y}=this.player;this.turn++;
      if(weapon==='spread')for(const vx of [-175,0,175])this.shoot(x,y-30,'laser',vx,-650,now);
      else if(weapon==='rapid')for(const dx of [-13,13])this.shoot(x+dx,y-24,'rapid',0,-840,now);
      else if(weapon==='beam')this.shoot(x,y-60,'beam',0,-940,now,3,true);
      else this.signature(now);
    }
    this.droneArt.forEach((d,i)=>d.setVisible(now<this.droneUntil).setPosition(Phaser.Math.Clamp(this.player.x+(i===0?-43:43),16,464),this.player.y+8+Math.sin(now*.006+i)*4));
    if(now<this.droneUntil&&now>=this.nextDrone){this.nextDrone=now+700;this.droneArt.forEach(d=>this.shoot(d.x,d.y-12,'missile',0,-360,now,2,false,true));}
    for(const child of this.bullets.getChildren()){
      const b=child as Sprite;
      if(b.getData('helix'))b.x=b.getData('originX')+Math.sin((now-b.getData('born'))*.013)*25*b.getData('helix');
      if(!b.getData('homing'))continue;
      if(now-b.getData('born')>2600){b.destroy();continue;}
      const target=(this.enemies.getChildren() as Sprite[]).filter(e=>e.active&&e.y>0&&e.y<this.player.y).sort((a,c)=>Phaser.Math.Distance.Between(b.x,b.y,a.x,a.y)-Phaser.Math.Distance.Between(b.x,b.y,c.x,c.y))[0];
      if(target){const angle=Math.atan2(target.y-b.y,target.x-b.x);b.setVelocity(Math.cos(angle)*430,Math.sin(angle)*430).setRotation(angle+Math.PI/2);}
    }
  }
}