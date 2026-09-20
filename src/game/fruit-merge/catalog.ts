export const FRUITS=[
  {name:'Ceri',radius:18},{name:'Stroberi',radius:23},{name:'Anggur',radius:28},
  {name:'Lemon',radius:34},{name:'Jeruk',radius:41},{name:'Apel',radius:48},
  {name:'Pir',radius:56},{name:'Persik',radius:65},{name:'Buah naga',radius:74},
  {name:'Nanas',radius:84},{name:'Melon',radius:96},{name:'Semangka',radius:108}
].map((fruit,level)=>({...fruit,level,image:`/art/premium/fruit-merge/${level}.webp`,points:2**(level+1)}));
export const FRUIT_WIDTH=360,FRUIT_HEIGHT=500,DANGER_LINE=70;