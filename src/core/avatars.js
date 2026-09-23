export const AVATARS = [
  { id: 'avatar_male', name: 'Kai', requirement: 'Teman pertama', target: 0, stat: 'totalWins' },
  { id: 'avatar_female', name: 'Mika', requirement: 'Teman pertama', target: 0, stat: 'totalWins' },
  { id: 'avatar_fox', name: 'Foxy', requirement: 'Menangkan 1 permainan', target: 1, stat: 'totalWins' },
  { id: 'avatar_frog', name: 'Kero', requirement: 'Menangkan 3 Memory Flip', target: 3, stat: 'memoryWins' },
  { id: 'avatar_cat', name: 'Pixel', requirement: 'Menangkan 5 Triple Match', target: 5, stat: 'tripleWins' },
  { id: 'avatar_space', name: 'Nova', requirement: 'Menangkan 10 Onet', target: 10, stat: 'onetWins' },
  { id: 'avatar_robot', name: 'Bolt', requirement: 'Bersihkan 20 garis Block Puzzle', target: 20, stat: 'blockLines' },
  { id: 'avatar_bunny', name: 'Mochi', requirement: 'Klaim 5 misi harian', target: 5, stat: 'totalDailyMissionsCompleted' },
  { id: 'avatar_lion', name: 'Leo', requirement: 'Menangkan 25 permainan', target: 25, stat: 'totalWins' },
  { id: 'avatar_owl', name: 'Ollie', requirement: 'Klaim hadiah login 5 kali', target: 5, stat: 'totalLoginRewards' },
  { id: 'avatar_penguin', name: 'Pip', requirement: 'Kumpulkan total 100 Permen', target: 100, stat: 'totalPermenEarned' }
];
export const isAvatarUnlocked = (profile, avatar) => (profile.statistics?.[avatar.stat] || 0) >= avatar.target;
export const unlockAvatars = profile => ({ ...profile, avatarCollection: AVATARS.filter(a => isAvatarUnlocked(profile, a)).map(a => a.id) });