// Permanent, cosmetic-only purchases. No paid mechanics, hidden odds or consumable skins.
export const COSMETICS = [
  {id:'avatar_mochi',name:'Mochi',category:'avatar',slot:'avatar',price:45,asset:'mochi',description:'Teman kelinci kecil untuk kartu profilmu.'},
  {id:'avatar_orbit',name:'Orbit',category:'avatar',slot:'avatar',price:65,asset:'orbit',description:'Astronaut kecil dengan mimpi besar.'},
  {id:'frame_mint',name:'Mint Club',category:'frame',slot:'frame',price:30,asset:'mint',description:'Bingkai profil mint dengan detail bintang.'},
  {id:'frame_sunset',name:'Golden Hour',category:'frame',slot:'frame',price:45,asset:'sunset',description:'Bingkai hangat untuk setiap pencapaian.'},
  {id:'tile2_mint',name:'Jade Duo',category:'tile',slot:'tile2',price:35,asset:'mint',description:'Skin domino 1×2 / 2×1. Tidak mengubah gambar atau aturan.'},
  {id:'tile2_sunset',name:'Honey Duo',category:'tile',slot:'tile2',price:35,asset:'sunset',description:'Finishing madu untuk tile domino.'},
  {id:'tile4_mint',name:'Jade Cube',category:'tile',slot:'tile4',price:45,asset:'mint',description:'Skin khusus tile besar 2×2. Dibeli terpisah dari tema.'},
  {id:'tile4_sunset',name:'Honey Cube',category:'tile',slot:'tile4',price:45,asset:'sunset',description:'Bingkai emas untuk tile 2×2.'},
  {id:'arrow_mint',name:'Mint Compass',category:'tile',slot:'arrow',price:30,asset:'mint',description:'Skin indikator tile arah, muncul mulai level 8.'},
  {id:'arrow_sunset',name:'Sun Compass',category:'tile',slot:'arrow',price:30,asset:'sunset',description:'Indikator arah keemasan. Mekanik arah tetap gratis.'},
  {id:'block_jelly',name:'Jelly Blocks',category:'block',slot:'block',price:65,asset:'jelly',description:'Balok kenyal mengilap, untuk mode level dan Infinity.'},
  {id:'block_wood',name:'Maple Blocks',category:'block',slot:'block',price:75,asset:'wood',description:'Tekstur kayu hangat, bentuk balok tetap klasik.'},
  {id:'block_ceramic',name:'Ceramic Blocks',category:'block',slot:'block',price:65,asset:'ceramic',description:'Motif keramik lembut untuk papan favoritmu.'},
  {id:'effect_stars',name:'Star Shower',category:'effect',slot:'effect',price:50,asset:'stars',description:'Hujan bintang saat menang Onet atau Block Puzzle.'},
  {id:'effect_confetti',name:'Club Confetti',category:'effect',slot:'effect',price:50,asset:'confetti',description:'Konfeti pastel untuk merayakan kemenangan.'},
];
export const cosmeticById = id => COSMETICS.find(item=>item.id===id);
export const ownsCosmetic = (profile,id) => (profile?.ownedCosmetics||[]).includes(id);
export const equippedCosmetic = (profile,slot) => {
  const id=profile?.equippedCosmetics?.[slot];
  const item=cosmeticById(id);
  return item?.slot===slot&&ownsCosmetic(profile,id)?item:null;
};
export const validateCosmeticEquip = (profile,equipped) => !!equipped && typeof equipped==='object' && !Array.isArray(equipped) && Object.entries(equipped).every(([slot,id])=>['avatar','frame','tile2','tile4','arrow','block','effect'].includes(slot) && (id===null || (cosmeticById(id)?.slot===slot&&ownsCosmetic(profile,id))));