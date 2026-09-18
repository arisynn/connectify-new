import {
  DAILY_INCOME_CAP,
  calcWinPermen,
  canReceive,
  creditIncome,
  getDailyIncome,
  getIncomeRemaining,
  getTodayKey,
} from '../src/core/economy.js';
import {
  CHEST_TYPES,
  CHEST_POINTS_REQUIRED,
  addChestProgress,
  openChestAction,
  calculateDynamicSpeedUpCost,
} from '../src/core/chest.js';
import { claimMissionReward } from '../src/core/misiHarian.js';
import { claimAchievement } from '../src/core/achievements.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const baseProfile = () => ({
  statistics: {},
  achievements: {},
  activeMissions: [],
  activeWeeklyMissions: [],
  pendingMissions: [],
  chestSlots: [null, null, null],
  chestProgress: 0,
  permen: 0,
});

try {
  // Win does not grant direct permen
  assert(calcWinPermen() === 0, 'calcWinPermen must be zero');
  assert(DAILY_INCOME_CAP === 100, 'Daily cap must be 100');

  // Per-op cap and daily cap
  let p = baseProfile();
  assert(canReceive(p, 10) === true, '10 should be receivable');
  assert(canReceive(p, 11) === false, '11 should be rejected');
  p = creditIncome(p, 10);
  assert(getDailyIncome(p) === 10, 'daily income should be 10');
  assert(getIncomeRemaining(p) === 90, 'remaining should be 90');

  // Spending does not restore budget
  p = { ...p, economy: { day: getTodayKey(), earned: 100 }, permen: 1000 };
  p.permen -= 50;
  assert(getIncomeRemaining(p) === 0, 'spending must not restore daily budget');

  // Day rollover reset
  const oldDayProfile = { ...p, economy: { day: '2000-01-01', earned: 100 } };
  assert(getDailyIncome(oldDayProfile) === 0, 'old day income must reset to 0');

  // Mission claim grants <=10
  let missionProfile = {
    ...baseProfile(),
    activeMissions: [{
      id: 'm1',
      type: 'clear',
      title: 'Test',
      progress: 1,
      target: 1,
      claimed: false,
      difficulty: 'Sulit',
      rewardType: 'permen',
      rewardAmount: 10,
    }],
    dailyMissionsDate: getTodayKey(),
    weeklyMissionsWeek: 1,
  };
  const missionClaim = claimMissionReward(missionProfile, 'm1');
  assert(!missionClaim.error, 'Mission claim should succeed');
  assert(missionClaim.permenDelta === 10, 'Mission reward should be 10');

  // Limit rejection keeps claim intact (unclaimed)
  missionProfile = {
    ...missionProfile,
    economy: { day: getTodayKey(), earned: 95 },
    activeMissions: [{ ...missionProfile.activeMissions[0], id: 'm2', claimed: false }],
  };
  const missionBlocked = claimMissionReward(missionProfile, 'm2');
  assert(missionBlocked.error === 'DAILY_INCOME_LIMIT', 'Claim should hit daily cap');
  assert(missionBlocked.profile.activeMissions[0].claimed === false, 'Blocked mission must remain unclaimed');

  // Achievement claim <=10
  const achProfile = {
    ...baseProfile(),
    statistics: { totalWins: 1 },
    achievements: { first_win: 0 },
  };
  const achResult = claimAchievement(achProfile, 'first_win');
  assert(!achResult.error, 'first_win should be claimable');
  assert(achResult.permenDelta <= 10, 'Achievement reward must be <=10');

  // Chest points and slot rules
  let chestProfile = baseProfile();
  chestProfile = addChestProgress(chestProfile, CHEST_POINTS_REQUIRED * 3);
  assert(chestProfile.chestSlots.filter(Boolean).length === 3, '3 chest slots should fill');
  chestProfile = addChestProgress(chestProfile, CHEST_POINTS_REQUIRED);
  assert(chestProfile.chestProgress === CHEST_POINTS_REQUIRED, 'overflow progress should cap at 5');

  // Chest timers and speed up rule
  assert(CHEST_TYPES.common.durationMs === 5 * 60 * 1000, 'common timer mismatch');
  assert(CHEST_TYPES.rare.durationMs === 20 * 60 * 1000, 'rare timer mismatch');
  assert(CHEST_TYPES.epic.durationMs === 60 * 60 * 1000, 'epic timer mismatch');
  const now = Date.now();
  const epicStartWith12MinLeft = now - (60 * 60 * 1000 - 12 * 60 * 1000);
  assert(calculateDynamicSpeedUpCost('epic', epicStartWith12MinLeft, now) >= 2, 'speed up should be >=2 for 12min');

  // Opening chest when over cap keeps chest unopened
  let capProfile = {
    ...baseProfile(),
    economy: { day: getTodayKey(), earned: 98 },
    chestSlots: [{ id: 'c1', type: 'common', startTime: now - 10 * 60 * 1000 }, null, null],
  };
  const openBlocked = openChestAction(capProfile, 0);
  assert(openBlocked.rewards?.error === 'DAILY_INCOME_LIMIT', 'open chest should respect daily cap');
  assert(openBlocked.profile.chestSlots[0] !== null, 'blocked chest should remain in slot');

  console.log('Economy helper tests passed');
} catch (e) {
  console.error('Economy helper tests FAILED:', e.message);
  process.exit(1);
}
