export const FRUITS=[
  {name:'Ceri',radius:15},{name:'Stroberi',radius:19},{name:'Anggur',radius:24},
  {name:'Lemon',radius:29},{name:'Jeruk',radius:35},{name:'Apel',radius:42},
  {name:'Pir',radius:49},{name:'Persik',radius:57},{name:'Buah naga',radius:65},
  {name:'Nanas',radius:74},{name:'Melon',radius:85},{name:'Semangka',radius:98}
].map((fruit,level)=>({...fruit,level,image:`/art/premium/fruit-merge/${level}.webp`,points:2**(level+1)}));
export const FRUIT_WIDTH=360,FRUIT_HEIGHT=500,DANGER_LINE=65;