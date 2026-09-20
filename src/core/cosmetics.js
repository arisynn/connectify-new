import { ART_REWARDS, earnedArtReward } from './artRewards.js';
import { SEASONAL_COSMETICS } from './seasonalCatalog.js';
const root='/art/premium';
const item=(id,name,category,slot,price,asset,description,folder='surfaces')=>({id,name,category,slot,price,asset,description,image:`${root}/${folder}/${asset}.webp`});
export const COSMETICS = [
  ...SEASONAL_COSMETICS,
  item('tile1_pearl','Pearl','tile','tile1',0,'cream','Skin bawaan tile 1×1.'),
  item('tile2_pearl','Pearl Duo','tile','tile2',0,'cream','Skin bawaan domino 1×2 dan 2×1.'),
  item('tile4_pearl','Pearl Cube','tile','tile4',0,'cream','Skin bawaan tile 2×2.'),
  item('arrow_pearl','Pearl Compass','tile','arrow',0,'cream','Indikator arah bawaan.'),
  item('block_pearl','Pearl Blocks','block','block',0,'cloud','Balok keramik biru bawaan.'),
  item('effect_blossom','Blossom Burst','effect','effect',0,'blossom','Kelopak kecil untuk kemenanganmu.','effects'),
  item('avatar_mochi','Mochi','avatar','avatar',45,'mochi','Kelinci beret dengan senyum kecil.','avatars'),
  item('avatar_orbit','Orbit','avatar','avatar',65,'orbit','Penjelajah kecil dari galaksi jauh.','avatars'),
  ...[['panda','Bambu',40],['fox','Rubi',45],['shiba','Kuma',45],['penguin','Pip',40],['koala','Lumi',50]].map(([id,name,price])=>item(`portrait_${id}`,name,'avatar','avatar',price,id,'Teman baru untuk profil klubmu.','avatars')),
  item('frame_mint','Mint Club','frame','frame',30,'mint','Porcelain mint dengan bintang emas.','frames'),
  item('frame_sunset','Golden Hour','frame','frame',45,'sunset','Bingkai bunga berlapis emas.','frames'),
  item('frame_moon','Moonlit','frame','frame',45,'moon','Lingkar perak dan bulan kecil.','frames'),
  item('tile1_candy','Strawberry Milk','tile','tile1',25,'candy','Finishing coral untuk tile 1×1.'),
  item('tile1_opal','Opal','tile','tile1',30,'opal','Kilau opal untuk tile 1×1.'),
  item('tile1_night','Midnight','tile','tile1',30,'night','Keramik malam untuk tile 1×1.'),
  item('tile2_mint','Jade Duo','tile','tile2',35,'mint','Skin domino. Gambar dan aturan tidak berubah.'),
  item('tile2_sunset','Honey Duo','tile','tile2',35,'sunset','Porselen madu untuk tile domino.'),
  item('tile4_mint','Jade Cube','tile','tile4',45,'mint','Skin khusus tile besar 2×2.'),
  item('tile4_sunset','Honey Cube','tile','tile4',45,'sunset','Finishing emas untuk tile 2×2.'),
  item('arrow_mint','Mint Compass','tile','arrow',30,'mint','Skin penanda arah. Mekanik tetap gratis.'),
  item('arrow_sunset','Sun Compass','tile','arrow',30,'sunset','Indikator arah keemasan.'),
  item('block_jelly','Jelly Blocks','block','block',65,'jelly','Balok merah muda mengilap.'),
  item('block_wood','Maple Blocks','block','block',75,'wood','Tekstur kayu maple lembut.'),
  item('block_ceramic','Ceramic Blocks','block','block',65,'opal','Kilau keramik opal untuk papanmu.'),
  item('effect_stars','Star Shower','effect','effect',50,'stars','Hujan bintang saat menang.','effects'),
  item('effect_confetti','Club Confetti','effect','effect',50,'confetti','Pita pastel untuk merayakan kemenangan.','effects'),
];
for (const [id,name,slot,asset] of [
  ['reward_avatar_bear','Bear · Hadiah','avatar','bear'],['reward_avatar_cat','Cat · Hadiah','avatar','cat'],['reward_avatar_panda','Panda · Hadiah','avatar','panda'],
  ['reward_tile1_cream','Cream · Hadiah','tile1','cream'],['reward_tile1_cloud','Cloud · Hadiah','tile1','cloud'],['reward_tile1_candy','Candy · Hadiah','tile1','candy'],
  ['reward_tile2_mint','Mint Duo · Hadiah','tile2','mint'],['reward_tile4_night','Night Cube · Hadiah','tile4','night'],['reward_block_wood','Wood · Hadiah','block','wood'],
  ['reward_arrow_mint','Mint Arrow · Hadiah','arrow','arrow_mint'],['reward_arrow_sunset','Sunset Arrow · Hadiah','arrow','arrow_sunset'],['reward_arrow_night','Night Arrow · Hadiah','arrow','arrow_night']
]) COSMETICS.push({...item(id,name,slot==='avatar'?'avatar':slot==='block'?'block':'tile',slot,null,asset,'Edisi awal, kini menjadi hadiah perjalananmu.'),image:`/art/${slot==='avatar'?'avatars':'skins'}/${asset}.webp`,reward:ART_REWARDS[id]});
// Permanent-art pricing: material finish < character/frame detail < full themed set.
const ATELIER_PRICES = {avatar_mochi:65,avatar_orbit:90,portrait_panda:60,portrait_fox:70,portrait_shiba:65,portrait_penguin:60,portrait_koala:75,frame_mint:50,frame_sunset:75,frame_moon:70,tile1_candy:35,tile1_opal:45,tile1_night:50,tile2_mint:55,tile2_sunset:60,tile4_mint:70,tile4_sunset:80,arrow_mint:35,arrow_sunset:40,block_jelly:80,block_wood:90,block_ceramic:85,effect_stars:65,effect_confetti:60};
for (const cosmetic of COSMETICS) {
  if (ATELIER_PRICES[cosmetic.id] !== undefined) cosmetic.price = ATELIER_PRICES[cosmetic.id];
}
export const DEFAULT_COSMETICS = {tile1:'tile1_pearl',tile2:'tile2_pearl',tile4:'tile4_pearl',arrow:'arrow_pearl',block:'block_pearl',effect:'effect_blossom',memoryCard:'card_mint',fruitBasket:'basket_rattan'};
// A single purchase owns all three Onet footprints. Existing single-skin owners
// receive the rest of their material family without a second charge.
export const SKIN_PACKS = [
  ['pearl','Pearl','cream',0],['candy','Strawberry Milk','candy',105],['opal','Opal','opal',125],
  ['night','Midnight','night',140],['mint','Jade','mint',135],['sunset','Honey','sunset',150],
  ['amber','Amber','amber',130],['enchanted','Enchanted','enchanted',150],['pixel','Pixel Pop','pixel',140],['frost','Frosted','frost',140]
].map(([key,name,asset,price])=>{
  const members=['tile1','tile2','tile4'].map(slot=>`${slot}_${key}`);
  for(const [index,slot] of ['tile1','tile2','tile4'].entries()) {
    let member=COSMETICS.find(c=>c.id===members[index]);
    if(!member){member=item(members[index],`${name} ${slot==='tile1'?'Tile':slot==='tile2'?'Duo':'Cube'}`,'tile',slot,price,asset,'Bagian dari paket skin lengkap.');COSMETICS.push(member);}
    member.packId=`tilepack_${key}`;member.hiddenIndividual=true;
  }
  return {...item(`tilepack_${key}`,`${name} Set`,'tile','tileSet',price,asset,'Satu paket permanen: 1×1, domino 1×2 / 2×1, dan 2×2.'),members,edition:['amber','enchanted','pixel','frost'].includes(key)?'seasonal':'atelier'};
});
COSMETICS.push(...SKIN_PACKS);
for(const [id,name,price] of [['mint','Club Garden',0],['autumn','Autumn Letters',65],['celestial','Celestial Notes',80],['arcade','Arcade Stories',70]]) COSMETICS.push({...item(`card_${id}`,name,'card','memoryCard',price,id,'Bagian belakang kartu bergambar untuk Memory Flip. Depan kartu tetap jelas untuk mencocokkan gambar.','cards'),edition:'seasonal'});
for (const game of ['onet','block','memory','fruit']) for (const [asset,name,price,motion,color] of [
  ['autumn','Autumn Drift',65,'drift','#ce7c35'],['magic','Magic Orbit',80,'orbit','#a178cb'],
  ['pixel','Pixel Pop',70,'pop','#438bc1'],['snow','Frost Bloom',75,'bloom','#53b4cb']
]) COSMETICS.push({...item(`anim_${game}_${asset}`,`${name} · ${{onet:'Onet',block:'Block',memory:'Memory',fruit:'Fruit'}[game]}`,'animation',`${game}Animation`,price,asset,game==='onet'?'Animasi pasangan dan pecahan tile. Hanya tampilan, bukan booster.':game==='memory'?'Partikel saat kamu menemukan pasangan kartu. Hanya tampilan.':game==='fruit'?'Percikan saat dua buah menyatu di Fruit Merge. Hanya tampilan.':'Animasi saat baris atau kolom bersih, termasuk mode Infinity.','effects'),motion,color,edition:'seasonal'});
// Fruit Merge baskets: original basket illustrations drawn as the board frame; fruit art and physics never change.
for (const [key,name,price] of [['rattan','Keranjang Rotan',0],['candy','Keranjang Stroberi',60],['frost','Keranjang Es',70],['night','Keranjang Malam',75],['pixel','Keranjang Piksel',65],['meadow','Keranjang Padang',60]])
  COSMETICS.push({...item(`basket_${key}`,name,'basket','fruitBasket',price,key,price===0?'Keranjang bawaan Fruit Merge.':'Ilustrasi keranjang baru untuk papan Fruit Merge. Buah dan fisika tetap sama.','baskets'),edition:'seasonal'});
export const cosmeticById = id => COSMETICS.find(item=>item.id===id);
export const ownsCosmetic = (profile,id) => {
  const cosmetic=cosmeticById(id);if(!cosmetic)return false;
  const owned=profile?.ownedCosmetics||[];
  const pack=cosmetic.members?cosmetic:SKIN_PACKS.find(p=>p.id===cosmetic.packId);
  return cosmetic.price===0||owned.includes(id)||earnedArtReward(profile,id)||!!(pack&&(pack.price===0||owned.includes(pack.id)||pack.members.some(member=>owned.includes(member))));
};
export const equippedCosmetic = (profile,slot) => {
  const selected=cosmeticById(profile?.equippedCosmetics?.[slot]);
  return selected?.slot===slot&&ownsCosmetic(profile,selected.id)?selected:cosmeticById(DEFAULT_COSMETICS[slot])||null;
};
export const isCosmeticEquipped = (profile,item) => item.members?item.members.every(id=>equippedCosmetic(profile,cosmeticById(id).slot)?.id===id):equippedCosmetic(profile,item.slot)?.id===item.id;
export const cosmeticEquipPatch = (profile,item,remove=false) => ({equippedCosmetics:{...profile.equippedCosmetics,...Object.fromEntries((item.members||[item.id]).map(id=>[cosmeticById(id).slot,remove?null:id]))}});
export const validateCosmeticEquip = (profile,equipped) => !!equipped && typeof equipped==='object' && !Array.isArray(equipped) && Object.entries(equipped).every(([slot,id])=>['avatar','frame','tile1','tile2','tile4','arrow','block','effect','onetAnimation','blockAnimation','memoryAnimation','fruitAnimation','memoryCard','fruitBasket'].includes(slot) && (id===null || (cosmeticById(id)?.slot===slot&&ownsCosmetic(profile,id))));