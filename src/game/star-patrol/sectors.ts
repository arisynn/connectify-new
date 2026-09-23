// Pure campaign data; legacy profile IDs and reward contracts stay unchanged.
export const INFINITY_ART='/art/infinity';
export const SECTORS=[
  {name:'Aurora Frontier',region:'PERBATASAN AURORA',boss:'Manta Prime',bossArt:'boss-manta',background:'aurora',color:'#97ede3',brief:'Lintasi armada drone. Hindari kipas tembakan Manta.',pattern:'Kipas plasma',enemy:'drone'},
  {name:'Glacial Rift',region:'CELAH GLASIAL',boss:'Cryo Kraken',bossArt:'boss-kraken',background:'rift',color:'#a8cfff',brief:'Interceptor bergerak zig-zag. Kraken memburu posisimu.',pattern:'Tembakan pemburu',enemy:'interceptor'},
  {name:'Solar Citadel',region:'BENTENG MATAHARI',boss:'Helios Core',bossArt:'boss-helios',background:'solar',color:'#ffda92',brief:'Tembus cruiser lapis baja dan pusaran peluru Helios.',pattern:'Spiral matahari',enemy:'cruiser'},
  {name:'Jade Tempest',region:'BADAI ZAMRUD',boss:'Jade Serpent',bossArt:'boss-serpent',background:'jade',color:'#a2efc3',brief:'Wasp menukik cepat. Cari celah di dinding peluru Serpent.',pattern:'Dinding bercelah',enemy:'wasp'},
  {name:'Violet Eclipse',region:'GERHANA VIOLET',boss:'Eclipse Twins',bossArt:'boss-eclipse',background:'eclipse',color:'#d2bfff',brief:'Bomber mengepung. Dua meriam Eclipse bergantian menyerang.',pattern:'Meriam kembar',enemy:'bomber'},
  {name:'Crimson Throne',region:'TAKHTA MERAH',boss:'Crimson Crown',bossArt:'boss-crown',background:'crown',color:'#ffb5c8',brief:'Guardian mengawal takhta. Crown menggabungkan seluruh pola.',pattern:'Badai mahkota',enemy:'guardian'},
];
export const sectorFor=(level:number)=>{
  const n=Math.max(1,Math.floor(level)||1),cycle=Math.floor((n-1)/6),rank=Math.min(30,n-1);
  return {...SECTORS[(n-1)%6],level:n,cycle,index:(n-1)%6,rank,
    difficulty:n===1?'Waspada':n===2?'Berbahaya':n<=4?'Ekstrem':n<=6?'Kritis':`Elite ${cycle}`,
    bossHp:80+rank*28+cycle*24,bulletSpeed:170+rank*8,spawnDelay:Math.max(470,1200-rank*70),
    bossInterval:Math.max(500,1450-rank*90),waveDuration:12000,
  };
};