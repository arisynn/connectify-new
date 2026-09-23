// Shared catalog and deterministic migration. No currency grants on migration.
export const STAR_ROOT = '/art/infinity';
export const SHIP_SIGNATURES={
  scout:{name:'Twin Ion',description:'Dua laser ion paralel. Presisi untuk membelah formasi.'},
  coral:{name:'Coral Fan',description:'Tiga peluru kipas. Menjangkau musuh di kedua sayap.'},
  glacier:{name:'Frost Lance',description:'Tombak es menembus beberapa musuh dalam satu garis.'},
  phantom:{name:'Ruby Burst',description:'Rentetan tiga peluru merah dengan jeda pengisian.'},
  mint:{name:'Seeker Pulse',description:'Plasma hijau melengkung mengejar target terdekat.'},
  solar:{name:'Solar Helix',description:'Dua peluru emas berpilin untuk menyapu jalur.'},
};
export const STAR_SHIPS = [
  ['scout','Scout',0,'scout'], ['coral','Coral Wing',60,'coral'],
  ['glacier','Glacier',70,'glacier'], ['phantom','Red Comet',75,'phantom'],
  ['mint','Mint Falcon',65,'mint'], ['solar','Solar Ace',60,'solar'],
].map(([key,name,price,asset])=>({id:`ship_${key}`,name,price,category:'ship',slot:'starShip',image:`${STAR_ROOT}/${asset}.png`,description:`${SHIP_SIGNATURES[key].name} — ${SHIP_SIGNATURES[key].description} HP dan hitbox tetap sama.`}));
export const STAR_TRAILS = [['blue','Ion Blue',0,'laser-blue'],['green','Mint Beam',35,'laser-green'],['red','Ruby Beam',40,'laser-red']].map(([key,name,price,asset])=>({id:`laser_${key}`,name,price,category:'laser',slot:'starLaser',image:`${STAR_ROOT}/${asset}.png`,description:'Warna laser permanen. Damage tidak berubah.'}));
export const STAR_UPGRADES = [
  {key:'hull',name:'Lambung',description:'Tambah 1 HP per tingkat.',image:`${STAR_ROOT}/hull.png`},
  {key:'cannon',name:'Meriam',description:'Tembakan 10% lebih cepat per tingkat.',image:`${STAR_ROOT}/cannon.png`},
  {key:'recovery',name:'Pelindung',description:'Tambah 0,4 detik kebal setelah terkena serangan per tingkat.',image:`${STAR_ROOT}/recovery.png`},
  {key:'damage',name:'Daya Senjata',description:'Tambah 20% damage semua senjata dan rudal per tingkat.',image:`${STAR_ROOT}/power-beam.png`},
  {key:'wingman',name:'Sistem Drone',description:'Tambah 2 detik durasi drone pendamping per tingkat.',image:`${STAR_ROOT}/power-drone.png`},
];
export const STAR_UPGRADE_ITEMS = STAR_UPGRADES.flatMap(u=>[25,45,75].map((price,i)=>({...u,id:`upgrade_star_${u.key}_${i+1}`,level:i+1,price,category:'upgrade',name:`${u.name} · Lv ${i+1}`})));
export const starUpgradeItem = id=>STAR_UPGRADE_ITEMS.find(u=>u.id===id);
export const starUpgradeLevel = (profile,key)=>Math.min(3,Math.max(0,Number(profile?.starUpgrades?.[key])||0));
export const purchaseStarUpgrade = (profile,id)=>{
  const item=starUpgradeItem(id);
  if(!item||item.level!==starUpgradeLevel(profile,item.key)+1)throw new Error('INVALID_UPGRADE_LEVEL');
  return {starUpgrades:{...profile.starUpgrades,[item.key]:item.level}};
};
export const migrateStarProfile = profile=>{
  if(profile?.starMigration===1)return profile;
  const p={...profile},map={basket_rattan:'ship_scout',basket_candy:'ship_coral',basket_frost:'ship_glacier',basket_night:'ship_phantom',basket_pixel:'ship_mint',basket_meadow:'ship_solar',anim_fruit_autumn:'laser_red',anim_fruit_magic:'laser_green',anim_fruit_pixel:'laser_blue',anim_fruit_snow:'laser_green'};
  p.ownedCosmetics=[...new Set([...(p.ownedCosmetics||[]),...(p.ownedCosmetics||[]).map(id=>map[id]).filter(Boolean)])];
  p.equippedCosmetics={...p.equippedCosmetics};
  if(map[p.equippedCosmetics.fruitBasket])p.equippedCosmetics.starShip=map[p.equippedCosmetics.fruitBasket];
  if(map[p.equippedCosmetics.fruitAnimation])p.equippedCosmetics.starLaser=map[p.equippedCosmetics.fruitAnimation];
  delete p.equippedCosmetics.fruitBasket;delete p.equippedCosmetics.fruitAnimation;
  p.starShields=p.starShields??p.fruitSwaps??3;p.starBlasts=p.starBlasts??p.fruitPops??3;
  p.starMigration=1;return p;
};