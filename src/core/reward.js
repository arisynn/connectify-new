import { addChestProgress } from './chest';
import { updateMissions } from './misiHarian';
import { getTodayKey } from './economy';
import { unlockAvatars } from './avatars';

export const RewardEngine = {
  processWin: (profile, payload = {}) => {
    const { game = 'onet', isWinner = true, isMultiplayer = false, isFlawless = false,
      timeElapsed = 0, score = 0, matches = 0, highestCombo = 0, blocksCleared = 0,
      linesCleared = 0, stars = 0, isDailyChallenge = false, runId, level = 1 } = payload;
    const empty = { profile, rewardResult: { chestPoints: 0, permen: 0, dailyBonus: 0 } };
    if (runId && (profile.processedRuns || []).includes(runId)) return empty;
    let p = { ...profile, statistics: { ...profile.statistics } };
    const s = p.statistics;
    if (runId) p.processedRuns = [...(p.processedRuns || []), runId].slice(-200);
    s.totalGames = (s.totalGames || 0) + 1;
    s.totalPlayTimeMs = (s.totalPlayTimeMs || 0) + timeElapsed;
    s.totalScore = (s.totalScore || 0) + score;
    s.highestScore = Math.max(s.highestScore || 0, score);
    s.highestCombo = Math.max(s.highestCombo || 0, highestCombo);
    s.totalMatches = (s.totalMatches || 0) + matches;
    s.totalBlocksCleared = (s.totalBlocksCleared || 0) + matches * 2 + blocksCleared;
    s[`${game}Games`] = (s[`${game}Games`] || 0) + 1;
    s[`${game}HighScore`] = Math.max(s[`${game}HighScore`] || 0, score);
    p.winStreak = isWinner ? (p.winStreak || 0) + 1 : 0;
    if (isWinner) {
      s.totalWins = (s.totalWins || 0) + 1;
      s[`${game}Wins`] = (s[`${game}Wins`] || 0) + 1;
      if (isFlawless) s.totalFlawless = (s.totalFlawless || 0) + 1;
      if (game === 'onet' && !isMultiplayer && !isDailyChallenge && level <= (p.highestLevel || 1)) p.highestLevel = Math.max(p.highestLevel || 1, level + 1);
      if (game === 'onet' && timeElapsed > 0 && timeElapsed < 45000) s.speedrunLevels = (s.speedrunLevels || 0) + 1;
      if (game === 'onet' && payload.progress >= 50) s.survivorLevels = (s.survivorLevels || 0) + 1;
      if (game === 'onet' && payload.remainingTime > 0 && payload.remainingTime <= 1) s.nearDeathEscapes = (s.nearDeathEscapes || 0) + 1;
    }
    if (game === 'block') {
      s.blockPuzzleGames = (s.blockPuzzleGames || 0) + 1;
      s.blockPuzzleStars = (s.blockPuzzleStars || 0) + stars;
      s.blockPuzzleHighScore = Math.max(s.blockPuzzleHighScore || 0, score);
      s.blockLines = (s.blockLines || 0) + linesCleared;
      s.blockCombo = Math.max(s.blockCombo || 0, highestCombo);
      if (isWinner) p.highestBlockPuzzleLevel = Math.max(p.highestBlockPuzzleLevel || 1, level + 1);
    }
    if (isMultiplayer) {
      s.multiplayerGames = (s.multiplayerGames || 0) + 1;
      if (isWinner) s.multiplayerWins = (s.multiplayerWins || 0) + 1;
    }
    if (isWinner && isDailyChallenge) {
      const key = `${getTodayKey()}:${game}`;
      if (!(p.dailyChallengeKeys || []).includes(key)) {
        p.dailyChallengeKeys = [...(p.dailyChallengeKeys || []).filter(k => k.startsWith(getTodayKey())), key];
        p.dailyChallengeDate = getTodayKey();
        s.dailyChallengesWon = (s.dailyChallengesWon || 0) + 1;
      }
    }
    const chestPoints = isWinner ? 2 + (isFlawless ? 1 : 0) + (highestCombo >= 8 ? 1 : 0) : 0;
    p = addChestProgress(p, chestPoints);
    if (isWinner) p = updateMissions(p, 'winLevel', 1);
    if (isWinner && isFlawless) p = updateMissions(p, 'flawless', 1);
    if (isWinner && (game === 'memory' || game === 'triple')) p = updateMissions(p, 'minigameWin', 1);
    if (isWinner && game === 'onet' && payload.progress >= 50) p = updateMissions(p, 'survivor', 1);
    if (isWinner && game === 'onet' && timeElapsed > 0 && timeElapsed < 45000) p = updateMissions(p, 'fast_clear', 1);
    for (const [event, amount] of [['combo', highestCombo], ['match', matches], ['score', score], ['blockLines', linesCleared]]) {
      if (amount > 0) p = updateMissions(p, event, amount);
    }
    return { profile: unlockAvatars(p), rewardResult: { chestPoints, permen: 0, dailyBonus: 0 } };
  }
};