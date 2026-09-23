import Phaser from 'phaser';
import {StarConfig,StarState,StarPhase,initialStarState,STAR_WIDTH as W,STAR_HEIGHT as H} from './types';
import {INFINITY_ART,sectorFor,SECTORS} from './sectors';
import {ENEMIES,EnemyKind,enemyKind,aimed,fan,bossVolley,Shot,FORMATIONS,formationSlots} from './armada';
import {StarArsenal,ARSENAL_ASSETS,POWERUPS} from './StarArsenal';
type Sprite=Phaser.Physics.Arcade.Sprite;

export class StarScene extends Phaser.Scene {
  state:StarState;player!:Sprite;enemies!:Phaser.Physics.Arcade.Group;bullets!:Phaser.Physics.Arcade.Group;hazards!:Phaser.Physics.Arcade.Group;pickups!:Phaser.Physics.Arcade.Group;
  private stars!:Phaser.GameObjects.TileSprite;private shieldArt!:Phaser.GameObjects.Image;private engineArt!:Phaser.GameObjects.Image;
  private cursors!:Phaser.Types.Input.Keyboard.CursorKeys;private keys:any;private elapsed=0;private nextEnemy=650;private nextBossShot=0;private nextHud=0;private safeUntil=2200;private arsenal!:StarArsenal;
  private boss?:Sprite;private spawned=0;private squads=0;private drops=0;private bossTurn=0;private sector;private stageStarted=0;private nextStageAt=0;private noticeUntil=1800;private reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(private config:StarConfig){super('star-patrol');this.state=initialStarState(5+config.hull);this.sector=sectorFor(1);}
  preload(){
    for(const file of new Set([...Object.keys(ENEMIES),...SECTORS.map(s=>s.bossArt),'hazard','heal','shield','flame','spark','cannon',...ARSENAL_ASSETS]))this.load.image(file,`${INFINITY_ART}/${file}.png`);
    SECTORS.forEach(s=>this.load.image(`space-${s.background}`,`${INFINITY_ART}/background-${s.background}.webp`));
    this.load.image('ship',this.config.ship);this.load.image('laser',this.config.laser);
    this.load.on('loaderror',()=>{this.state.error='Aset belum termuat. Kembali lalu buka permainan lagi.';this.emit();});
  }
  create(){
    this.stars=this.add.tileSprite(W/2,H/2,W,H,`space-${this.sector.background}`).setTileScale(W/720,H/1020);
    this.enemies=this.physics.add.group();this.bullets=this.physics.add.group();this.hazards=this.physics.add.group();this.pickups=this.physics.add.group();
    this.player=this.physics.add.sprite(W/2,H-88,'ship').setDisplaySize(68,68).setDepth(4).setCollideWorldBounds(true);
    this.player.body!.setSize(this.player.width*.3,this.player.height*.46,true);
    this.engineArt=this.add.image(this.player.x,this.player.y+32,'flame').setDisplaySize(16,34).setDepth(3);
    this.shieldArt=this.add.image(this.player.x,this.player.y,'shield').setDisplaySize(85,85).setDepth(5);
    this.arsenal=new StarArsenal(this,this.player,this.bullets,this.enemies,this.config.cannon,this.config.ship,this.config.laser,this.config.damage,this.config.wingman);
    this.cursors=this.input.keyboard!.createCursorKeys();this.keys=this.input.keyboard!.addKeys('W,A,S,D');
    this.input.keyboard!.on('keydown-ESC',()=>{if(this.state.phase==='playing')this.setPhase('paused');else if(this.state.phase==='paused')this.setPhase('playing');});
    const move=(p:Phaser.Input.Pointer)=>{if(p.isDown&&this.state.phase==='playing'){this.player.setPosition(Phaser.Math.Clamp(p.x,32,W-32),Phaser.Math.Clamp(p.y-28,165,H-34));this.player.body!.reset(this.player.x,this.player.y);}};
    this.input.on('pointerdown',move);this.input.on('pointermove',move);
    this.physics.add.overlap(this.bullets,this.enemies,(bullet,enemy)=>{
      const b=bullet as Sprite;if(this.state.phase!=='playing'||!b.active)return;
      const hits=b.getData('hits') as WeakSet<object>;if(hits?.has(enemy))return;hits?.add(enemy);
      const damage=b.getData('damage')||1;if(!b.getData('piercing'))b.destroy();this.hitEnemy(enemy as Sprite,damage);
    });
    this.physics.add.overlap(this.player,this.enemies,(_p,enemy)=>{if(this.elapsed>=this.safeUntil){if(enemy!==this.boss)(enemy as Sprite).destroy();this.damage();}});
    this.physics.add.overlap(this.player,this.hazards,(_p,h)=>{(h as Sprite).destroy();this.damage();});
    this.physics.add.overlap(this.player,this.pickups,(_p,h)=>this.collect(h as Sprite));
    this.game.canvas.setAttribute('data-testid','star-canvas');this.game.canvas.setAttribute('aria-label','Arena Infinity. Geser pesawat atau gunakan tombol panah dan WASD.');
    this.state.ready=!this.state.error;this.physics.pause();this.emit();
  }
  setPhase(phase:StarPhase){
    if(this.state.phase==='over'||!this.state.ready)return;
    const first=this.state.phase==='ready';this.state.phase=phase;phase==='playing'?this.physics.resume():this.physics.pause();
    if(first)this.notice('GELOMBANG 01 · ARMADA TERDETEKSI');this.player.setVelocity(0);this.emit();
  }
  end(won=false){if(this.state.phase==='over')return;this.state.phase='over';this.state.won=won;this.physics.pause();this.emit();}
  usePower(kind:string){
    if(kind==='star_shield')this.safeUntil=this.elapsed+5000;
    else {for(const enemy of [...this.enemies.getChildren()])this.hitEnemy(enemy as Sprite,enemy===this.boss?8:99);this.hazards.clear(true,true);if(!this.reduced)this.cameras.main.flash(150,170,240,215);}
    this.emit();
  }
  private notice(text:string,duration=1800){this.state.notice=text;this.noticeUntil=this.elapsed+duration;}
  private emit(){this.config.onState({...this.state,...this.arsenal?.status(this.elapsed),time:Math.round(this.elapsed),shield:this.elapsed<this.safeUntil});}
  private collect(drop:Sprite){
    if(!drop.active||this.state.phase!=='playing')return;
    const kind=drop.getData('power'),power=POWERUPS.find(p=>p.id===kind);drop.destroy();
    if(kind==='heal')this.state.hp=Math.min(this.state.maxHp,this.state.hp+1);
    else if(kind==='shield')this.safeUntil=this.elapsed+5000;
    else this.arsenal.collect(kind,this.elapsed);
    this.notice(`${power?.name.toUpperCase()||'POWER-UP'} AKTIF`,1400);this.config.onSound('match');this.emit();
  }
  private damage(){
    if(this.state.phase!=='playing'||this.elapsed<this.safeUntil)return;
    this.state.hp--;this.safeUntil=this.elapsed+1400+this.config.recovery*400;this.config.onSound('error');
    if(!this.reduced)this.cameras.main.shake(100,.004);if(this.state.hp<=0)this.end();else this.emit();
  }
  private hitEnemy(enemy:Sprite,damage:number){
    if(!enemy.active||this.state.phase==='over')return;
    const hp=enemy.getData('hp')-damage;enemy.setData('hp',hp);
    if(enemy===this.boss)this.state.bossHp=Math.max(0,hp);
    if(hp>0){enemy.setTint(0xffe0bb);this.time.delayedCall(80,()=>enemy.active&&enemy.clearTint());return;}
    const {x,y}=enemy,isBoss=enemy===this.boss;enemy.destroy();this.state.kills++;this.state.score+=100;this.config.onSound('match');
    const burst=this.add.image(x,y,'spark').setDisplaySize(isBoss?130:44,isBoss?130:44).setDepth(6);
    this.tweens.add({targets:burst,alpha:0,displayWidth:isBoss?210:90,displayHeight:isBoss?210:90,angle:70,duration:350,onComplete:()=>burst.destroy()});
    if(!isBoss&&this.state.kills%4===0){
      const power=POWERUPS[this.drops++%POWERUPS.length],drop=this.pickups.create(x,y,power.asset) as Sprite;
      drop.setDisplaySize(37,37).setVelocityY(112).setDepth(5).setData('power',power.id);
    }
    if(isBoss){
      this.state.bosses++;this.state.score+=1000;this.state.bossHp=0;this.state.bossMax=0;
      this.hazards.clear(true,true);this.enemies.clear(true,true);this.state.hp=Math.min(this.state.maxHp,this.state.hp+1);
      this.safeUntil=this.elapsed+3000;this.nextStageAt=this.elapsed+2000;
      this.notice('BOSS HANCUR · +1 HP · PERTEMPURAN BERLANJUT',2000);
    }
    this.emit();
  }
  private advanceStage(){
    this.state.stage++;this.sector=sectorFor(this.state.stage);this.stageStarted=this.elapsed;this.nextStageAt=0;this.boss=undefined;
    this.state.bossPhase=1;this.bossTurn=0;this.nextEnemy=this.elapsed+650;
    this.stars.setTexture(`space-${this.sector.background}`).setTileScale(W/720,H/1020);
    this.notice('ANCAMAN MENINGKAT · TETAP BERTAHAN',1800);
  }
  private spawnFormation(){
    if(this.enemies.countActive(true)>12+Math.min(10,this.sector.rank))return;
    const localWave=Math.min(3,1+Math.floor((this.elapsed-this.stageStarted)/12000)),formation=(this.squads+this.sector.index)%FORMATIONS.length;
    this.state.formation=FORMATIONS[formation];this.squads++;
    formationSlots(formation).forEach(({x,y},i)=>{
      this.spawned++;const kind=this.sector.level===1&&this.squads===1?'drone':enemyKind(this.sector.index,localWave,this.squads+i),spec=ENEMIES[kind];
      const e=this.enemies.create(x,y,kind) as Sprite;
      const hp=Math.ceil(spec.hp*(1+this.sector.rank*.18))+Math.floor(this.sector.rank/3)+this.sector.cycle;
      e.setDisplaySize(spec.size,spec.size).setData({kind,hp,maxHp:hp,originX:x,born:this.elapsed,nextFire:this.elapsed+1800+i*180,squad:this.squads,returning:false,passes:0});
      e.body!.setSize(e.width*.67,e.height*.65,true);e.setVelocityY(spec.speed+this.sector.rank*3+localWave*8);
      if(kind==='wasp')e.setVelocityX((this.player.x-x)*.23);
    });
  }
  private fire(shots:Shot[]){
    for(const shot of shots){const h=this.hazards.create(shot.x,shot.y,'hazard') as Sprite;h.setDisplaySize(24,26).setVelocity(shot.vx,shot.vy);h.body!.setSize(h.width*.3,h.height*.5,true);}
  }
  private updateEnemies(){
    for(const child of this.enemies.getChildren()){
      const e=child as Sprite;if(e===this.boss)continue;
      const kind=e.getData('kind') as EnemyKind,spec=ENEMIES[kind],age=this.elapsed-e.getData('born');
      if(e.y>H-100&&!e.getData('returning')){
        e.setData('returning',true).setData('passes',e.getData('passes')+1);
        e.setVelocity(e.x<W/2?-65:65,-(spec.speed+35+this.sector.rank*2)).setAngle(180);
      }else if(e.y<85&&e.getData('returning')){
        e.setData({returning:false,originX:e.x,born:this.elapsed,nextFire:this.elapsed+900});
        e.setVelocity(kind==='wasp'?(this.player.x-e.x)*.28:0,spec.speed+20+this.sector.rank*3).setAngle(0);
      }
      if(!e.getData('returning')&&(kind==='interceptor'||kind==='bomber'))e.x=e.getData('originX')+Math.sin(age*(kind==='bomber'?.0018:.003))*55;
      e.x=Phaser.Math.Clamp(e.x,28,W-28);
      if(kind==='guardian')e.setAngle(age*.025);
      const shot=spec.shot||(e.getData('passes')>0?4000:0);
      if(shot&&e.y>55&&e.y<this.player.y-90&&this.elapsed>=e.getData('nextFire')){
        const speed=135+this.sector.rank*6;e.setData('nextFire',this.elapsed+Math.max(1100,shot-this.sector.rank*70));
        this.fire(['interceptor','drone','wasp'].includes(kind)?[aimed(e.x,e.y,this.player.x,this.player.y,speed)]:fan(e.x,e.y,kind==='cruiser'?2:3,speed,kind==='guardian'?.4:.22));
      }
    }
  }
  private spawnBoss(){
    this.boss=this.enemies.create(W/2,-90,this.sector.bossArt) as Sprite;this.boss.setDisplaySize(150,150).setDepth(2);
    this.boss.body!.setSize(this.boss.width*.7,this.boss.height*.6,true);
    this.state.bossMax=this.sector.bossHp;this.state.bossHp=this.state.bossMax;this.boss.setData('hp',this.state.bossMax);
    this.nextBossShot=this.elapsed+2500;this.notice(this.sector.boss.toUpperCase()+' · BERSIAP!',2400);this.emit();
  }
  private updateBoss(dt:number){
    if(!this.boss?.active)return;
    this.boss.y=Math.min(130,this.boss.y+dt*.11);
    this.boss.x=W/2+Math.sin(this.elapsed*(.0008+this.sector.index*.00008))*(this.sector.index===3?105:140);
    const enraged=this.state.bossHp<=this.state.bossMax*.45;
    if(enraged&&this.state.bossPhase===1){this.state.bossPhase=2;this.notice('FASE 02 · SERANGAN MENINGKAT',2200);}
    if(this.boss.y>=130&&this.elapsed>=this.nextBossShot){
      this.nextBossShot=this.elapsed+this.sector.bossInterval*(enraged?.72:1);
      this.fire(bossVolley(this.sector.index,this.boss.x,this.boss.y+42,this.player.x,this.player.y,this.sector.bulletSpeed,this.bossTurn++,enraged));
    }
  }
  update(_time:number,delta:number){
    if(!this.player)return;
    if(this.state.phase!=='playing'){this.engineArt.setVisible(false);this.shieldArt.setVisible(false);return;}
    const dt=Math.min(delta,50);this.elapsed+=dt;this.stars.tilePositionY-=dt*.018;
    const dx=Number(this.cursors.right.isDown||this.keys.D.isDown)-Number(this.cursors.left.isDown||this.keys.A.isDown),dy=Number(this.cursors.down.isDown||this.keys.S.isDown)-Number(this.cursors.up.isDown||this.keys.W.isDown);
    this.player.setVelocity(dx*340,dy*340);this.player.y=Phaser.Math.Clamp(this.player.y,165,H-34);
    this.engineArt.setVisible(true).setPosition(this.player.x,this.player.y+30).setAlpha(.8+Math.sin(this.elapsed*.02)*.15);
    this.shieldArt.setPosition(this.player.x,this.player.y).setVisible(this.elapsed<this.safeUntil);
    this.arsenal.update(this.elapsed);
    if(this.nextStageAt&&this.elapsed>=this.nextStageAt)this.advanceStage();
    const stageTime=this.elapsed-this.stageStarted,localWave=Math.min(3,1+Math.floor(stageTime/this.sector.waveDuration)),wave=(this.state.stage-1)*3+localWave;
    if(wave!==this.state.wave){this.state.wave=wave;this.notice(`GELOMBANG ${String(wave).padStart(2,'0')} · ${localWave===3?'ARMADA ELITE':'BALA BANTUAN'}`);}
    if(!this.nextStageAt&&stageTime<36000&&this.elapsed>=this.nextEnemy){this.nextEnemy=this.elapsed+Math.max(2650,3900-this.sector.rank*100-localWave*100);this.spawnFormation();}
    if(!this.nextStageAt&&stageTime>=36000&&!this.boss)this.spawnBoss();
    this.updateEnemies();this.updateBoss(dt);
    for(const child of this.pickups.getChildren()){const p=child as Sprite;if(Phaser.Math.Distance.Between(p.x,p.y,this.player.x,this.player.y)<100)this.physics.moveToObject(p,this.player,260);}
    for(const group of [this.bullets,this.enemies,this.hazards,this.pickups])for(const child of [...group.getChildren()]){const s=child as Sprite;if(s!==this.boss&&(s.y>H+65||s.y< -230||s.x< -80||s.x>W+80))s.destroy();}
    if(this.elapsed>this.noticeUntil)this.state.notice='';
    if(this.elapsed>this.nextHud){this.nextHud=this.elapsed+100;this.emit();}
  }
}