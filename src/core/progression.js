export const XP_RANKS = [
  { level: 1, title: 'Teman Baru' }, { level: 5, title: 'Pencari Pasangan' },
  { level: 10, title: 'Peracik Kombo' }, { level: 20, title: 'Bintang Klub' },
  { level: 35, title: 'Master Puzzle' }, { level: 50, title: 'Legenda Connectify' },
];
export const xpForLevel = level => 100 * (level - 1) + 25 * (level - 1) * (level - 2);
export const getAccountXP = profile => Number.isFinite(profile?.accountXP) ? Math.max(0, profile.accountXP) :
  Math.max(0, (profile?.statistics?.totalWins || 0) * 100, ((profile?.highestLevel || 1) - 1) * 100);
export const getAccountProgress = profile => {
  const xp = getAccountXP(profile);
  const level = Math.floor((-75 + Math.sqrt(5625 + 100 * xp)) / 50) + 1;
  const floor = xpForLevel(level), next = xpForLevel(level + 1);
  const rank = [...XP_RANKS].reverse().find(r => level >= r.level) || XP_RANKS[0];
  return { xp, level, title: rank.title, current: xp - floor, needed: next - floor, percent: (xp - floor) / (next - floor) * 100,
    nextRank: XP_RANKS.find(r => r.level > level) };
};
export const awardXP = (profile, amount) => ({ ...profile, accountXP: getAccountXP(profile) + Math.max(0, Math.floor(amount)), xpVersion: 1 });
export const missionXP = mission => ({ Mudah: 25, Menengah: 40, Sulit: 60, 'Sangat Sulit': 80 }[mission.difficulty] || 25) * (mission.id.startsWith('w_') || mission.scope === 'weekly' ? 2 : 1);