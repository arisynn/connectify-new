// One currency. All grants go through the same daily budget, on client and server.
import { cosmeticById } from './cosmetics.js';
export const DAILY_INCOME_CAP = 100;
export const ECONOMY_VERSION = 3;
export const ITEM_PRICES = { hint: 8, shuffle: 12, hammer: 14, bomb: 18 };
export const THEME_PRICES = { ocean: 60, forest: 80, candy: 80, space: 100, meadow: 0, sakura: 120, bakery: 110, galaxy: 150, fruit: 100 };
export const DEFAULT_THEME_PRICE = 100;
export const getItemPrice = id => typeof id !== 'string' || id.startsWith('reward_') ? null : id.startsWith('theme_') ? (THEME_PRICES[id.slice(6)] ?? null) : (cosmeticById(id)?.price ?? ITEM_PRICES[id] ?? null);
export const CONSUMABLE_ITEMS = ['hint', 'shuffle', 'hammer', 'bomb'];
export const ITEM_FIELD = { hint: 'hints', shuffle: 'shuffles', hammer: 'hammers', bomb: 'bombs' };
export const DEFAULT_ITEM_COUNT = 3;
export const DAILY_CHALLENGE_REWARD = 0;
export const DAILY_CHALLENGE_TIME = 90;
export const MISSION_REWARDS = { daily: { Mudah: 5, Menengah: 7, Sulit: 10 }, weekly: { Menengah: 8, Sulit: 9, 'Sangat Sulit': 10 } };
export const calcWinPermen = () => 0;
// A single reset boundary for every device: 00:00 WIB (UTC+7).
export const getTodayKey = (now = Date.now()) => new Date(now + 7 * 3600000).toISOString().slice(0, 10);
export const getDailyIncome = (profile, now = Date.now()) => profile?.economy?.day === getTodayKey(now) ? Number(profile.economy.earned || 0) : 0;
export const getIncomeRemaining = (profile, now = Date.now()) => Math.max(0, DAILY_INCOME_CAP - getDailyIncome(profile, now));
export const canReceive = (profile, amount) => Number.isInteger(amount) && amount > 0 && amount <= 10 && getIncomeRemaining(profile) >= amount;
export const creditIncome = (profile, amount) => ({
  ...profile,
  economy: { version: ECONOMY_VERSION, day: getTodayKey(), earned: getDailyIncome(profile) + amount },
  statistics: { ...profile.statistics, totalPermenEarned: (profile.statistics?.totalPermenEarned || 0) + amount }
});
export const recordTransaction = (profile, { id, amount, source, label, balance }) => {
  if (!amount) return profile;
  const ledger = profile.ledger || [];
  if (ledger.some(entry => entry.id === id)) return profile;
  return { ...profile, ledger: [{ id, amount, source, label, balance, at: new Date().toISOString() }, ...ledger].slice(0, 200) };
};
export const TRANSACTION_LABELS = {
  CLAIM_MISSION_REWARD: 'Hadiah misi', CLAIM_ACHIEVEMENT_REWARD: 'Hadiah pencapaian',
  OPEN_CHEST: 'Hadiah peti', PURCHASE_ITEM: 'Pembelian', SPEED_UP_CHEST: 'Percepat peti'
};