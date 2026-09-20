import { ART_REWARDS, earnedArtReward } from './artRewards.js';
const root='/art/premium';
const item=(id,name,category,slot,price,asset,description,folder='surfaces')=>({id,name,category,slot,price,asset,description,image:`${root}/${folder}/${asset}.webp`});
export const COSMETICS = [
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
export const DEFAULT_COSMETICS = {tile1:'tile1_pearl',tile2:'tile2_pearl',tile4:'tile4_pearl',arrow:'arrow_pearl',block:'block_pearl',effect:'effect_blossom'};
export const cosmeticById = id => COSMETICS.find(item=>item.id===id);
export const ownsCosmetic = (profile,id) => !!cosmeticById(id) && (cosmeticById(id).price===0 || (profile?.ownedCosmetics||[]).includes(id) || earnedArtReward(profile,id));
export const equippedCosmetic = (profile,slot) => {
  const selected=cosmeticById(profile?.equippedCosmetics?.[slot]);
  return selected?.slot===slot&&ownsCosmetic(profile,selected.id)?selected:cosmeticById(DEFAULT_COSMETICS[slot])||null;
};
export const validateCosmeticEquip = (profile,equipped) => !!equipped && typeof equipped==='object' && !Array.isArray(equipped) && Object.entries(equipped).every(([slot,id])=>['avatar','frame','tile1','tile2','tile4','arrow','block','effect'].includes(slot) && (id===null || (cosmeticById(id)?.slot===slot&&ownsCosmetic(profile,id))));