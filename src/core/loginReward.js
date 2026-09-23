import { getTodayKey, canReceive, creditIncome } from './economy';
import { awardXP } from './progression.js';

// Daily login reward replaces chests. One claim per WIB day, streak-based amount (max 10 per grant).
export const LOGIN_REWARDS = [5, 5, 6, 7, 8, 9, 10];
export const LOGIN_REWARD_XP = 20;

const dayKey = (offsetDays, now = Date.now()) => getTodayKey(now - offsetDays * 86400000);

export const getLoginRewardState = (profile, now = Date.now()) => {
  const saved = profile?.loginReward || {};
  const today = getTodayKey(now);
  const claimedToday = saved.day === today;
  const streak = claimedToday ? saved.streak || 1 : saved.day === dayKey(1, now) ? (saved.streak || 0) + 1 : 1;
  const dayIndex = ((streak - 1) % LOGIN_REWARDS.length + LOGIN_REWARDS.length) % LOGIN_REWARDS.length;
  return { claimedToday, streak, dayIndex, amount: LOGIN_REWARDS[dayIndex], schedule: LOGIN_REWARDS };
};

// Pure claim used by client (optimistic) and server (authoritative). Returns { profile, permenDelta, error }.
export const claimLoginReward = (profile, now = Date.now()) => {
  const state = getLoginRewardState(profile, now);
  if (state.claimedToday) return { profile, permenDelta: 0, error: 'LOGIN_REWARD_CLAIMED' };
  if (!canReceive(profile, state.amount)) return { profile, permenDelta: 0, error: 'DAILY_INCOME_LIMIT' };
  let p = creditIncome({ ...profile, loginReward: { day: getTodayKey(now), streak: state.streak } }, state.amount);
  p.statistics = { ...p.statistics, totalLoginRewards: (p.statistics?.totalLoginRewards || 0) + 1, bestLoginStreak: Math.max(p.statistics?.bestLoginStreak || 0, state.streak) };
  p = awardXP(p, LOGIN_REWARD_XP);
  return { profile: p, permenDelta: state.amount, error: null, streak: state.streak };
};
