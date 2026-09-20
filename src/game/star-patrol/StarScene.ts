import Phaser from 'phaser';
import {STAR_ROOT} from '../../core/starPatrol';
import {StarConfig,StarState,StarPhase,initialStarState,STAR_WIDTH as W,STAR_HEIGHT as H} from './types';
type Sprite=Phaser.Physics.Arcade.Sprite;

export class StarScene extends Phaser.Scene {
  state:StarState;player!:Sprite;enemies!:Phaser.Physics.Arcade.Group;bullets!:Phaser.Physics.Arcade.Group;hazards!:Phaser.Physics.Arcade.Group;pickups!:Phaser.Physics.Arcade.Group;
  private stars!:Phaser.GameObjects.TileSprite;private shieldArt!:Phaser.GameObjects.Image;private engineArt!:Phaser.GameObjects.Image;
  private cursors!:Phaser.Types.Input.Keyboard.CursorKeys;private keys:any;private elapsed=0;private nextEnemy=600;private nextShot=0;private nextBossShot=0;private nextHud=0;private safeUntil=3000;private boss?:Sprite;private spawned=0;
  constructor(private config:StarConfig){super('star-patrol');this.state=initialStarState(5+config.hull);}
  preload(){
    const sprites:any={stars:'stars',enemy:'enemyRed1',enemy2:'enemyGreen2',boss:'ufoRed',hazard:'laserRed01',heal:'pill_green',shield:'shield3',flame:'fire00',spark:'star2'};
    Object.entries(sprites).forEach(([key,file])=>this.load.image(key,`${STAR_ROOT}/${file}.png`));
    this.load.image('ship',this.config.ship);this.load.image('laser',this.config.laser);
    this.load.on('loaderror',()=>{this.state.error='Aset belum termuat. Kembali lalu buka permainan lagi.';this.emit();});
  }
  create(){
    this.stars=this.add.tileSprite(0,0,W,H,'stars').setOrigin(0).setAlpha(.9);
    this.enemies=this.physics.add.group();this.bullets=this.physics.add.group();this.hazards=this.physics.add.group();this.pickups=this.physics.add.group();
    this.player=this.physics.add.sprite(W/2,H-100,'ship').setDisplaySize(58,48).setDepth(4).setCollideWorldBounds(true);
    // A forgiving body entirely inside the painted fuselage, independent of skin dimensions.
    this.player.body!.setSize(this.player.width*.45,this.player.height*.65,true);
    this.engineArt=this.add.image(this.player.x,this.player.y+28,'flame').setDisplaySize(16,30).setDepth(3);
    this.shieldArt=this.add.image(this.player.x,this.player.y,'shield').setDisplaySize(84,84).setDepth(5);
    this.cursors=this.input.keyboard!.createCursorKeys();this.keys=this.input.keyboard!.addKeys('W,A,S,D');
    this.input.keyboard!.on('keydown-ESC',()=>{if(this.state.phase==='playing')this.setPhase('paused');else if(this.state.phase==='paused')this.setPhase('playing');});
    const move=(p:Phaser.Input.Pointer)=>{if(p.isDown&&this.state.phase==='playing'){this.player.setPosition(Phaser.Math.Clamp(p.x,30,W-30),Phaser.Math.Clamp(p.y-36,90,H-36));this.player.body!.reset(this.player.x,this.player.y);}};
    this.input.on('pointerdown',move);this.input.on('pointermove',move);
    this.physics.add.overlap(this.bullets,this.enemies,(bullet,enemy)=>{(bullet as Sprite).destroy();this.hitEnemy(enemy as Sprite,1);});
    this.physics.add.overlap(this.player,this.enemies,(_p,enemy)=>{if(this.elapsed>=this.safeUntil){if(enemy!==this.boss)(enemy as Sprite).destroy();this.damage();}});
    this.physics.add.overlap(this.player,this.hazards,(_p,h)=>{(h as Sprite).destroy();this.damage();});
    this.physics.add.overlap(this.player,this.pickups,(_p,h)=>{(h as Sprite).destroy();this.state.hp=Math.min(this.state.maxHp,this.state.hp+1);this.config.onSound('match');this.emit();});
    this.game.canvas.setAttribute('data-testid','star-canvas');this.game.canvas.setAttribute('aria-label','Arena Star Patrol');
    this.state.ready=!this.state.error;this.physics.pause();this.emit();
  }
  setPhase(phase:StarPhase){
    if(this.state.phase==='over'||!this.state.ready)return;
    this.state.phase=phase;phase==='playing'?this.physics.resume():this.physics.pause();
    this.player.setVelocity(0);this.emit();
  }
  end(won=false){if(this.state.phase==='over')return;this.state.phase='over';this.state.won=won;this.physics.pause();this.emit();}
  usePower(kind:string){
    if(kind==='star_shield')this.safeUntil=this.elapsed+5000;
    else {for(const enemy of [...this.enemies.getChildren()])this.hitEnemy(enemy as Sprite,enemy===this.boss?8:10);this.hazards.clear(true,true);this.cameras.main.flash(180,170,240,215);}
    this.emit();
  }
  private emit(){this.config.onState({...this.state,time:Math.round(this.elapsed),shield:this.elapsed<this.safeUntil});}
  private damage(){
    if(this.state.phase!=='playing'||this.elapsed<this.safeUntil)return;
    this.state.hp--;this.safeUntil=this.elapsed+1600+this.config.recovery*400;this.config.onSound('error');
    this.cameras.main.shake(100,.004);if(this.state.hp<=0)this.end();else this.emit();
  }
  private hitEnemy(enemy:Sprite,damage:number){
    if(!enemy.active)return;
    const hp=enemy.getData('hp')-damage;enemy.setData('hp',hp);
    if(enemy===this.boss)this.state.bossHp=Math.max(0,hp);
    if(hp>0){enemy.setTint(0xffc2aa);this.time.delayedCall(80,()=>enemy.active&&enemy.clearTint());return;}
    const {x,y}=enemy;const isBoss=enemy===this.boss;enemy.destroy();
    this.state.kills++;this.state.score+=100;this.config.onSound('match');
    const burst=this.add.image(x,y,'spark').setDisplaySize(34,34);this.tweens.add({targets:burst,alpha:0,scaleX:2,scaleY:2,duration:250,onComplete:()=>burst.destroy()});
    if(this.state.kills%8===0&&!isBoss){const heal=this.pickups.create(x,y,'heal') as Sprite;heal.setDisplaySize(25,25).setVelocityY(90);}
    if(isBoss){this.state.bosses=1;this.state.score+=1000;this.end(true);}else this.emit();
  }
  private spawnEnemy(){
    this.spawned++;const x=55+((this.spawned*137)%370);
    const enemy=this.enemies.create(x,-35,this.spawned%3===0?'enemy2':'enemy') as Sprite;
    enemy.setDisplaySize(47,40).setData('hp',this.state.wave===3&&this.spawned%3===0?2:1);
    enemy.body!.setSize(enemy.width*.8,enemy.height*.8,true);enemy.setVelocityY(70+this.state.wave*12+Math.min(30,this.config.level*2));
  }
  private spawnBoss(){
    this.boss=this.enemies.create(W/2,95,'boss') as Sprite;this.boss.setDisplaySize(110,110);
    this.boss.body!.setSize(this.boss.width*.8,this.boss.height*.8,true);
    this.state.bossMax=16+Math.min(24,this.config.level*3);this.state.bossHp=this.state.bossMax;this.boss.setData('hp',this.state.bossMax);this.emit();
  }
  update(_time:number,delta:number){
    if(!this.player)return;
    if(this.state.phase!=='playing'){this.engineArt.setVisible(this.state.phase==='ready');this.shieldArt.setVisible(false);return;}
    this.elapsed+=Math.min(delta,50);this.stars.tilePositionY-=delta*.045;
    const dx=Number(this.cursors.right.isDown||this.keys.D.isDown)-Number(this.cursors.left.isDown||this.keys.A.isDown);
    const dy=Number(this.cursors.down.isDown||this.keys.S.isDown)-Number(this.cursors.up.isDown||this.keys.W.isDown);
    this.player.setVelocity(dx*330,dy*330);this.player.y=Phaser.Math.Clamp(this.player.y,80,H-32);
    this.engineArt.setVisible(true).setPosition(this.player.x,this.player.y+30).setAlpha(.75+Math.sin(this.elapsed*.02)*.2);
    this.shieldArt.setPosition(this.player.x,this.player.y).setVisible(this.elapsed<this.safeUntil);
    if(this.elapsed>=this.nextShot){this.nextShot=this.elapsed+330*(1-this.config.cannon*.1);const b=this.bullets.create(this.player.x,this.player.y-30,'laser') as Sprite;b.setDisplaySize(9,29).setVelocityY(-640);}
    this.state.wave=Math.min(3,1+Math.floor(this.elapsed/12000));
    if(this.elapsed<36000&&this.elapsed>=this.nextEnemy){this.nextEnemy=this.elapsed+Math.max(750,1450-this.state.wave*120-this.config.level*15);this.spawnEnemy();}
    if(this.elapsed>=36000&&!this.boss)this.spawnBoss();
    if(this.boss?.active){this.boss.x=W/2+Math.sin(this.elapsed*.0012)*155;
      if(this.elapsed>this.nextBossShot){this.nextBossShot=this.elapsed+1700;for(const vx of [-65,0,65]){const h=this.hazards.create(this.boss.x,this.boss.y+40,'hazard') as Sprite;h.setDisplaySize(9,27).setVelocity(vx,165);}}}
    for(const group of [this.bullets,this.enemies,this.hazards,this.pickups])for(const child of [...group.getChildren()]){const s=child as Sprite;if(s.y>H+60||s.y< -70)s.destroy();}
    if(this.elapsed>=180000)this.end();
    if(this.elapsed>this.nextHud){this.nextHud=this.elapsed+100;this.emit();}
  }
}