// Shared catalog: client rendering and authoritative purchases use the same IDs.
export const SEASONAL_THEMES = [
  {id:'autumn_harvest',name:'Autumn Harvest',bg:'#faf4ee',accent:'#d97736',price:120,tag:'Jeda hangat',description:'Daun keemasan, panen kecil, dan hangatnya musim gugur.'},
  {id:'magic_atelier',name:'Magic Atelier',bg:'#f5f0fb',accent:'#9b75b1',price:150,tag:'Sedikit keajaiban',description:'Ramuan, kristal, dan benda ajaib dari studio penyihir.'},
  {id:'retro_arcade',name:'Retro Arcade',bg:'#f0f4fa',accent:'#528acb',price:140,tag:'Nostalgia bermain',description:'Konsol mungil dan pernak-pernik arcade penuh warna.'},
  {id:'alpine_winter',name:'Alpine Winter',bg:'#f2f8fc',accent:'#62acc4',price:130,tag:'Sejuk & nyaman',description:'Salju, rajutan, dan cokelat hangat di pegunungan.'}
];
const make=(id,name,category,slot,price,folder,asset,description)=>({id,name,category,slot,price,asset,description,image:`/art/premium/${folder}/${asset}.webp`,edition:'seasonal'});
export const SEASONAL_COSMETICS = [
  ...[['hedgehog','Hazel',75,'Landak kecil dengan syal musim gugur.'],['wizard-owl','Professor Hoot',90,'Burung hantu penjaga studio sihir.'],['robot','Bip',80,'Robot arcade yang selalu siap bermain.'],['polar-cub','Snowy',80,'Beruang kutub dengan penutup telinga hangat.']].map(([id,name,price,desc])=>make(`avatar_${id}`,name,'avatar','avatar',price,'avatars',id,desc)),
  ...[['autumn','Autumn Wreath',65],['enchanted','Enchanted Ring',80],['arcade','Arcade Loop',70],['frost','Frost Halo',75]].map(([id,name,price])=>make(`frame_${id}`,name,'frame','frame',price,'frames',id,'Bingkai bergambar untuk potret profilmu.')),
  ...[['amber','Amber',40],['enchanted','Enchanted',50],['pixel','Pixel Pop',45],['frost','Frosted',45]].flatMap(([id,name,price])=>[
    make(`tile1_${id}`,`${name} Tile`,'tile','tile1',price,'surfaces',id,'Permukaan bergambar untuk tile 1×1. Gambar pasangan tetap jelas.'),
    make(`block_${id}`,`${name} Blocks`,'block','block',Number(price)+40,'surfaces',id,'Tekstur balok permanen. Tidak mengubah aturan atau kekuatan.')
  ]),
  ...[['amber','Amber'],['frost','Frosted']].flatMap(([id,name])=>[
    make(`tile2_${id}`,`${name} Duo`,'tile','tile2',60,'surfaces',id,'Skin untuk kedua arah domino: 1×2 dan 2×1.'),
    make(`tile4_${id}`,`${name} Cube`,'tile','tile4',80,'surfaces',id,'Skin tile besar 2×2. Cocok dipadukan dengan skin Duo.')
  ]),
  ...[['autumn','Falling Leaves',65],['magic','Magic Sparkles',75],['pixel','Pixel Party',65],['snow','Snowfall',70]].map(([id,name,price])=>make(`effect_${id}`,name,'effect','effect',price,'effects',id,'Partikel bergambar untuk merayakan kemenangan.'))
];