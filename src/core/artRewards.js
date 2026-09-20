import { getAccountProgress } from './progression.js';

// Legacy art is earned, never sold. Requirements are shared by UI and server.
export const ART_REWARDS = {
  reward_sakura: { kind: 'level', target: 3 },
  reward_bakery: { kind: 'level', target: 5 },
  reward_galaxy: { kind: 'achievement', target: 3 },
  reward_meadow: { kind: 'login', target: 3 },
  reward_fruit: { kind: 'login', target: 7 },
  reward_avatar_bear: { kind: 'login', target: 2 },
  reward_avatar_cat: { kind: 'level', target: 4 },
  reward_avatar_panda: { kind: 'achievement', target: 2 },
  reward_tile1_cream: { kind: 'login', target: 1 },
  reward_tile1_cloud: { kind: 'login', target: 5 },
  reward_tile1_candy: { kind: 'achievement', target: 1 },
  reward_tile2_mint: { kind: 'level', target: 4 },
  reward_tile4_night: { kind: 'level', target: 6 },
  reward_block_wood: { kind: 'achievement', target: 4 },
  reward_arrow_mint: { kind: 'level', target: 7 },
  reward_arrow_sunset: { kind: 'login', target: 10 },
  reward_arrow_night: { kind: 'achievement', target: 5 },
};
export const FREE_THEMES = ['sweets', 'meadow'];
export const artRewardProgress = (profile, rule) => !rule ? 0 : rule.kind === 'level' ? getAccountProgress(profile).level :
  rule.kind === 'login' ? Number(profile?.statistics?.totalLoginDays || 0) :
  Object.values(profile?.achievements || {}).reduce((sum, tier) => sum + (Number.isFinite(tier) ? Math.max(0, tier) : 0), 0);
export const earnedArtReward = (profile, id) => !!ART_REWARDS[id] && artRewardProgress(profile, ART_REWARDS[id]) >= ART_REWARDS[id].target;
export const artRewardLabel = rule => !rule ? '' : rule.kind === 'level' ? `Level akun ${rule.target}` : rule.kind === 'login' ? `Login ${rule.target} hari` : `Klaim ${rule.target} tier pencapaian`;
export const ownsTheme = (profile, id) => FREE_THEMES.includes(id) || (profile?.unlockedThemes || []).includes(id) || earnedArtReward(profile, id);
export const unlockArtRewards = profile => {
  const earned = Object.keys(ART_REWARDS).filter(id => earnedArtReward(profile, id));
  const themes = earned.filter(id => !id.includes('_avatar_') && !id.includes('_tile') && !id.includes('_block_') && !id.includes('_arrow_'));
  return { ...profile, unlockedThemes: [...new Set([...FREE_THEMES, ...(profile.unlockedThemes || []), ...themes])],
    ownedCosmetics: [...new Set([...(profile.ownedCosmetics || []), ...earned.filter(id => !themes.includes(id))])] };
};
export const checkInArtRewards = (profile, now = Date.now()) => {
  const day = new Date(now + 7 * 3600000).toISOString().slice(0, 10);
  if (profile.artCheckInDay === day) return unlockArtRewards(profile);
  return unlockArtRewards({ ...profile, artCheckInDay: day, statistics: { ...profile.statistics, totalLoginDays: Number(profile.statistics?.totalLoginDays || 0) + 1 } });
};