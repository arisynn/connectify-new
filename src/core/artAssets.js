export const ART_ROOT = '/art/premium';
export const BRAND_MARK = `${ART_ROOT}/brand/mark.webp`;
export const artIcon = name => name==='star-patrol'?'/art/infinity/scout.png':name==='star_shield'?'/art/infinity/hull.png':name==='star_blast'?'/art/infinity/nova.png':`${ART_ROOT}/ui/${name}.webp`;
export const cosmeticImage = item => item?.image || `${ART_ROOT}/surfaces/cream.webp`;
export const BRAND_LOGOS = {
  connectify_logo: BRAND_MARK,
  avatar_male: `${ART_ROOT}/avatars/bear.webp`, avatar_female: `${ART_ROOT}/avatars/cat.webp`,
  ...Object.fromEntries(['hint','shuffle','hammer','bomb','permen','collection','multiplayer','leaderboard'].map(name => [name, artIcon(name)])),
  theme: artIcon('theme'), themes: artIcon('theme'), palette: artIcon('theme'),
  achievement: artIcon('achievements'), achievements: artIcon('achievements'), trophy: artIcon('achievements'),
  mission: artIcon('missions'), missions: artIcon('missions'), notification: artIcon('notifications'), notifications: artIcon('notifications'),
  chest_common: `${ART_ROOT}/chests/common.webp`, chest_rare: `${ART_ROOT}/chests/rare.webp`, chest_epic: `${ART_ROOT}/chests/epic.webp`,
  chest: `${ART_ROOT}/chests/common.webp`, play: artIcon('onet'), store: artIcon('collection'), shop: artIcon('collection')
};