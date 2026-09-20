// Shared catalog and deterministic migration. No currency grants on migration.
export const STAR_ROOT = '/art/star-patrol';
export const STAR_SHIPS = [
  ['scout','Scout',0,'playerShip1_blue'], ['coral','Coral Wing',60,'playerShip2_red'],
  ['glacier','Glacier',70,'playerShip3_blue'], ['phantom','Red Comet',75,'playerShip3_red'],
  ['mint','Mint Falcon',65,'playerShip2_green'], ['solar','Solar Ace',60,'playerShip1_orange'],
].map(([key,name,price,asset])=>({id:`ship_${key}`,name,price,category:'ship',slot:'starShip',image:`${STAR_ROOT}/${asset}.png`,description:'Skin pesawat permanen. Kekuatan dan hitbox tetap sama.'}));
export const STAR_TRAILS = [['blue','Ion Blue',0,'laserBlue01'],['green','Mint Beam',35,'laserGreen01'],['red','Ruby Beam',40,'laserRed01']].map(([key,name,price,asset])=>({id:`laser_${key}`,name,price,category:'laser',slot:'starLaser',image:`${STAR_ROOT}/${asset}.png`,description:'Warna laser permanen. Damage tidak berubah.'}));
export const STAR_UPGRADES = [
  {key:'hull',name:'Lambung',description:'Tambah 1 HP per tingkat.',image:`${STAR_ROOT}/shield_gold.png`},
  {key:'cannon',name:'Meriam',description:'Tembakan 10% lebih cepat per tingkat.',image:`${STAR_ROOT}/bolt_gold.png`},
  {key:'recovery',name:'Pelindung',description:'Tambah 0,4 detik kebal setelah terkena serangan per tingkat.',image:`${STAR_ROOT}/star_gold.png`},
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