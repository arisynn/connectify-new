import { addChestProgress } from './chest';
import { updateMissions } from './misiHarian';
import { getTodayKey } from './economy';
import { unlockAvatars } from './avatars';
import { awardXP, getAccountProgress } from './progression.js';
import {getClaimableAchievements} from './achievements';

export const RewardEngine = {
  processWin: (profile, payload = {}) => {
    const { game = 'onet', isWinner = true, isMultiplayer = false, isFlawless = false,
      timeElapsed = 0, score = 0, matches = 0, highestCombo = 0, blocksCleared = 0,
      linesCleared = 0, stars = 0, isDailyChallenge = false, runId, level = 1 } = payload;
    const empty = { profile, rewardResult: { chestPoints: 0, permen: 0, dailyBonus: 0, xp: 0, leveledUp: false, accountLevel: getAccountProgress(profile).level } };
    if (runId && (profile.processedRuns || []).includes(runId)) return empty;
    const xp = isWinner ? 100 + (isFlawless ? 25 : 0) + Math.min(25, highestCombo * 2) : Math.min(40, Math.floor(score / 100));
    const previousLevel = getAccountProgress(profile).level;
    let p = { ...awardXP(profile, xp), statistics: { ...profile.statistics } };
    const s = p.statistics;
    if (runId) p.processedRuns = [...(p.processedRuns || []), runId].slice(-200);
    s.totalGames = (s.totalGames || 0) + 1;
    s.totalPlayTimeMs = (s.totalPlayTimeMs || 0) + timeElapsed;
    s.totalScore = (s.totalScore || 0) + score;
    s.highestScore = Math.max(s.highestScore || 0, score);
    s.highestCombo = Math.max(s.highestCombo || 0, highestCombo);
    s.totalMatches = (s.totalMatches || 0) + matches;
    s.totalSplits = (s.totalSplits || 0) + (payload.splits || 0);
    s.totalBlocksCleared = (s.totalBlocksCleared || 0) + matches * (game==='triple'?3:2) + blocksCleared;
    s[`${game}Games`] = (s[`${game}Games`] || 0) + 1;
    s[`${game}HighScore`] = Math.max(s[`${game}HighScore`] || 0, score);
    s[`${game}Matches`] = (s[`${game}Matches`] || 0) + matches;
    s[`${game}PlayTimeMs`] = (s[`${game}PlayTimeMs`] || 0) + timeElapsed;
    s[`${game}BestCombo`] = Math.max(s[`${game}BestCombo`] || 0, highestCombo);
    if(game==='onet'&&isDailyChallenge){s.sprintGames=(s.sprintGames||0)+1;if(isWinner)s.sprintWins=(s.sprintWins||0)+1;}
    p.winStreak = isWinner ? (p.winStreak || 0) + 1 : 0;
    if (isWinner) {
      s.totalWins = (s.totalWins || 0) + 1;
      s[`${game}Wins`] = (s[`${game}Wins`] || 0) + 1;
      if (isFlawless) s.totalFlawless = (s.totalFlawless || 0) + 1;
      if (game === 'onet' && !isMultiplayer && !isDailyChallenge && level <= (p.highestLevel || 1)) {p.highestLevel = Math.max(p.highestLevel || 1, level + 1);p.currentLevel=p.highestLevel;}
      if (game === 'onet' && timeElapsed > 0 && timeElapsed < 45000) s.speedrunLevels = (s.speedrunLevels || 0) + 1;
      if (game === 'onet' && payload.progress >= 50) s.survivorLevels = (s.survivorLevels || 0) + 1;
      if (game === 'onet' && payload.remainingTime > 0 && payload.remainingTime <= 1) s.nearDeathEscapes = (s.nearDeathEscapes || 0) + 1;
    }
    if (game === 'block-infinity') {
      s.infinityHighScore = Math.max(s.infinityHighScore || 0, score);
      s.infinityGames = (s.infinityGames || 0) + 1;
      s.infinityLines = (s.infinityLines || 0) + linesCleared;
      s.blockLines = (s.blockLines || 0) + linesCleared;
    }
    if (game === 'block') {
      s.blockPuzzleGames = (s.blockPuzzleGames || 0) + 1;
      s.blockPuzzleStars = (s.blockPuzzleStars || 0) + stars;
      s.blockPuzzleHighScore = Math.max(s.blockPuzzleHighScore || 0, score);
      s.blockLines = (s.blockLines || 0) + linesCleared;
      s.blockCombo = Math.max(s.blockCombo || 0, highestCombo);
      if (isWinner && !isMultiplayer && level <= (p.highestBlockPuzzleLevel || 1)) { p.highestBlockPuzzleLevel = Math.max(p.highestBlockPuzzleLevel || 1, level + 1); p.blockPuzzleLevel = p.highestBlockPuzzleLevel; }
    }
    if (game === 'star') {
      s.starKills=(s.starKills||0)+(payload.kills||0);
      s.starBosses=(s.starBosses||0)+(payload.bosses||0);
      s.starBestSector=Math.max(s.starBestSector||0,isWinner?level:0);
      if(isWinner&&level<=(p.starLevel||1))p.starLevel=Math.max(p.starLevel||1,level+1);
      p=updateMissions(p,'starKills',payload.kills||0);
      p=updateMissions(p,'starBosses',payload.bosses||0);
      p=updateMissions(p,'starRound',1);
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
    const chestPoints = isWinner ? 2 + (isFlawless ? 1 : 0) + (highestCombo >= 8 ? 1 : 0) : (game === 'star' && payload.kills >= 10 ? 1 : 0);
    p = addChestProgress(p, chestPoints);
    if (isWinner) p = updateMissions(p, 'winLevel', 1);
    if (isWinner && isFlawless) p = updateMissions(p, 'flawless', 1);
    if (isWinner && (game === 'memory' || game === 'triple')) p = updateMissions(p, 'minigameWin', 1);
    if(game==='memory'){p=updateMissions(p,'memoryPairs',matches);p=updateMissions(p,'memoryCombo',highestCombo);if(isWinner)p=updateMissions(p,'memoryWin',1);}
    if(game==='triple'){p=updateMissions(p,'tripleTrios',matches);if(isWinner)p=updateMissions(p,'tripleWin',1);}
    if(game==='block-infinity')p=updateMissions(p,'infinityRound',1);
    if (isWinner && game === 'onet' && payload.progress >= 50) p = updateMissions(p, 'survivor', 1);
    if (isWinner && game === 'onet' && timeElapsed > 0 && timeElapsed < 45000) p = updateMissions(p, 'fast_clear', 1);
    for (const [event, amount] of [['combo', highestCombo], ['match', game==='onet'?matches:0], ['score', score], ['blockLines', linesCleared], ['split', payload.splits || 0], ['playGame', 1]]) {
      if (amount > 0) p = updateMissions(p, event, amount);
    }
    const accountLevel=getAccountProgress(p).level;
    const previousAchievements=new Set(getClaimableAchievements(profile).map(a=>`${a.id}:${a.tierIdx}`));
    const unlocked=getClaimableAchievements(p).filter(a=>!previousAchievements.has(`${a.id}:${a.tierIdx}`));
    if(unlocked.length)p.notifications=[...unlocked.map(a=>({id:`achievement-${a.id}-${a.tierIdx}-${runId||Date.now()}`,title:'Pencapaian baru!',message:`${a.title} siap diklaim di tab Progres.`,type:'achievement',timestamp:Date.now(),read:false})),...(p.notifications||[])].slice(0,50);
    return { profile: unlockAvatars(p), rewardResult: { chestPoints, permen: 0, dailyBonus: 0, xp, accountLevel, leveledUp: accountLevel>previousLevel } };
  }
};