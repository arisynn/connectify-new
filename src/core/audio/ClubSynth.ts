export type AudioSettings={musicVol:number;sfxVol:number;muteMusic:boolean;muteSfx:boolean};
export class ClubSynth {
  context:AudioContext|null=null; music:GainNode|null=null; sfx:GainNode|null=null;
  scene:'menu'|'game'|'off'='off'; step=0; next=0; timer:any; settings:AudioSettings;
  constructor(settings:AudioSettings){this.settings=settings;}
  unlock=()=>{
    if(!this.context){
      const AC=window.AudioContext||(window as any).webkitAudioContext;if(!AC)return;
      const c=this.context=new AC();this.music=c.createGain();this.sfx=c.createGain();
      const compressor=c.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=3;
      this.music.connect(compressor);this.sfx.connect(compressor);compressor.connect(c.destination);
      this.apply(this.settings);this.next=c.currentTime+.06;
      this.timer=setInterval(this.schedule,100);
    }
    if(this.context.state==='suspended'){this.next=this.context.currentTime+.06;this.context.resume().catch(()=>{});}
  };
  apply=(settings:AudioSettings)=>{
    this.settings=settings;const now=this.context?.currentTime||0;
    this.music?.gain.setTargetAtTime(settings.muteMusic||this.scene==='off'?0:settings.musicVol/100*.38,now,.15);
    this.sfx?.gain.setTargetAtTime(settings.muteSfx?0:settings.sfxVol/100*.65,now,.03);
  };
  setScene=(scene:'menu'|'game'|'off')=>{if(this.scene!==scene){this.scene=scene;this.step=0;this.next=(this.context?.currentTime||0)+.08;this.apply(this.settings);}};
  note=(hz:number,start:number,duration:number,volume:number,type:OscillatorType='sine',bus=this.music)=>{
    const c=this.context;if(!c||!bus)return;
    const osc=c.createOscillator(),gain=c.createGain();osc.type=type;osc.frequency.value=hz;
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain);gain.connect(bus);osc.start(start);osc.stop(start+duration+.03);osc.onended=()=>{osc.disconnect();gain.disconnect();};
  };
  schedule=()=>{
    const c=this.context;if(!c||c.state!=='running'||this.scene==='off'||document.hidden||this.settings.muteMusic)return;
    if(this.next<c.currentTime)this.next=c.currentTime+.03;
    const tempo=this.scene==='menu'?84:102,beat=60/tempo/2;
    const melody=this.scene==='menu'?[72,0,76,79,0,76,74,0,72,76,0,81,79,0,76,74]:[72,79,76,0,74,81,79,0,76,79,84,0,81,79,74,0];
    const chords=[[48,55,64],[45,52,60],[41,48,57],[43,50,59]];
    const hz=(m:number)=>440*Math.pow(2,(m-69)/12);
    while(this.next<c.currentTime+.18){
      const n=this.step%16,bar=Math.floor(this.step/16)%4;
      if(melody[n]){this.note(hz(melody[n]),this.next,.6,.09,'triangle');this.note(hz(melody[n]),this.next+beat*.65,.45,.025);}
      if(n%8===0)chords[bar].forEach(m=>this.note(hz(m),this.next,beat*7,.055));
      if(n%4===0)this.note(58,this.next,.13,.1);
      this.step++;this.next+=beat;
    }
  };
  sound=(key:string)=>{
    if(this.settings.muteSfx||document.hidden)return;this.unlock();if(!this.context)return;
    const t=this.context.currentTime;
    const patterns:Record<string,number[]>={click:[660],place:[240,360],match:[659,880],split:[440,659,988],clear:[523,659,784],combo:[659,784,988,1319],win:[523,659,784,1047,1319],lose:[440,349,294],wrong:[185,165],shuffle:[392,494,587],purchase:[784,988,1175]};
    (patterns[key]||patterns.click).forEach((f,i)=>this.note(f,t+i*.065,key==='win'?.45:key==='click'?.055:.18,key==='click'?.06:.14,key==='wrong'?'sine':'triangle',this.sfx));
  };
  visibility=()=>{if(document.hidden)this.context?.suspend().catch(()=>{});else if(this.context)this.unlock();};
  dispose=()=>{clearInterval(this.timer);this.context?.close().catch(()=>{});this.context=null;};
}