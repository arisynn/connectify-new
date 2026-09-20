import {Bodies,Body,Composite,Engine,Events} from 'matter-js';
import {FRUITS,FRUIT_WIDTH,FRUIT_HEIGHT,DANGER_LINE} from './catalog';
type FruitBody=Body & {plugin:{level:number;born:number}};
export class FruitWorld{
  engine=Engine.create({enableSleeping:true});phase:'ready'|'playing'|'paused'|'over'='ready';
  score=0;merges=0;largest=0;drops=0;bestCombo=0;combo=0;current=0;next=0;dangerSince=0;lastDrop=-999;lastMerge=-999;
  effects:{id:number;x:number;y:number;born:number}[]=[];private mergeQueue:[FruitBody,FruitBody][]=[];private queued=new Set<number>();private effectId=0;
  constructor(private random=()=>Math.random()){
    this.engine.gravity.y=1.1;
    Composite.add(this.engine.world,[Bodies.rectangle(-18,FRUIT_HEIGHT/2,36,FRUIT_HEIGHT*3,{isStatic:true}),Bodies.rectangle(FRUIT_WIDTH+18,FRUIT_HEIGHT/2,36,FRUIT_HEIGHT*3,{isStatic:true}),Bodies.rectangle(FRUIT_WIDTH/2,FRUIT_HEIGHT+16,FRUIT_WIDTH+72,32,{isStatic:true})]);
    this.current=this.pick();this.next=this.pick();
    Events.on(this.engine,'collisionStart',event=>{for(const {bodyA,bodyB} of event.pairs){const a=bodyA as FruitBody,b=bodyB as FruitBody;if(a.label==='fruit'&&b.label==='fruit'&&a.plugin.level===b.plugin.level&&!this.queued.has(a.id)&&!this.queued.has(b.id)){this.queued.add(a.id);this.queued.add(b.id);this.mergeQueue.push([a,b]);}}});
  }
  private pick(){return Math.floor(this.random()*4);}
  get fruits(){return Composite.allBodies(this.engine.world).filter(body=>body.label==='fruit') as FruitBody[];}
  get time(){return this.engine.timing.timestamp;}
  get cooldown(){return Math.max(0,650-(this.time-this.lastDrop));}
  createFruit(level:number,x:number,y:number){
    const radius=FRUITS[level].radius;
    const fruit=Bodies.circle(Math.max(radius,Math.min(FRUIT_WIDTH-radius,x)),y,radius,{label:'fruit',restitution:.13,friction:.35,frictionAir:.009,density:.0015,plugin:{level,born:this.time}}) as FruitBody;
    Composite.add(this.engine.world,fruit);return fruit;
  }
  drop(x:number){if(this.phase!=='playing'||this.cooldown>0)return false;this.createFruit(this.current,x,28);this.drops++;this.lastDrop=this.time;this.current=this.next;this.next=this.pick();return true;}
  update(delta:number){
    if(this.phase!=='playing')return;
    Engine.update(this.engine,Math.min(delta,1000/60));
    for(const [a,b] of this.mergeQueue){
      const level=a.plugin.level,next=level+1,x=(a.position.x+b.position.x)/2,y=(a.position.y+b.position.y)/2;
      Composite.remove(this.engine.world,[a,b]);
      if(next<FRUITS.length){const fruit=this.createFruit(next,x,y);Body.setVelocity(fruit,{x:(a.velocity.x+b.velocity.x)/3,y:Math.min(0,(a.velocity.y+b.velocity.y)/3)});}
      this.score+=FRUITS[Math.min(next,FRUITS.length-1)].points;this.merges++;this.largest=Math.max(this.largest,Math.min(next,FRUITS.length-1));
      this.combo=this.time-this.lastMerge<1300?this.combo+1:1;this.bestCombo=Math.max(this.bestCombo,this.combo);this.lastMerge=this.time;
      this.effects.push({id:++this.effectId,x,y,born:this.time});
    }
    this.mergeQueue=[];this.queued.clear();this.effects=this.effects.filter(e=>this.time-e.born<480);
    const overflow=this.fruits.some(b=>b.position.y-FRUITS[b.plugin.level].radius<DANGER_LINE&&this.time-b.plugin.born>1500&&(b.speed<.5||this.time-b.plugin.born>4000));
    if(overflow){if(!this.dangerSince)this.dangerSince=this.time;if(this.time-this.dangerSince>2300)this.phase='over';}else this.dangerSince=0;
    if(this.fruits.length>110)this.phase='over';
  }
  snapshot(){return {phase:this.phase,score:this.score,merges:this.merges,largest:this.largest,drops:this.drops,bestCombo:this.bestCombo,current:this.current,next:this.next,cooldown:this.cooldown,time:this.time,danger:this.dangerSince>0,dangerLeft:this.dangerSince?Math.max(0,2300-(this.time-this.dangerSince)):2300,effects:[...this.effects],fruits:this.fruits.map(b=>({id:b.id,level:b.plugin.level,x:b.position.x,y:b.position.y,angle:b.angle}))};}
  destroy(){Events.off(this.engine,'collisionStart');Composite.clear(this.engine.world,false);Engine.clear(this.engine);}
}