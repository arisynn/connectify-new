import { canReceive, creditIncome } from './economy';

export const CHEST_TYPES = {
    common: { name: 'Peti Biasa', durationMs: 5 * 60 * 1000 },
    rare: { name: 'Peti Langka', durationMs: 20 * 60 * 1000 },
    epic: { name: 'Peti Epik', durationMs: 60 * 60 * 1000 },
};

export const CHEST_POINTS_REQUIRED = 5;

// Reward tables (single currency: permen)
export const CHEST_REWARDS = {
    common: { permen: [5, 5], hints: [1, 1], shuffles: [0, 0], hammers: [0, 0], bombs: [0, 0] },
    rare:   { permen: [8, 8], hints: [1, 1], shuffles: [1, 1], hammers: [0, 0], bombs: [0, 0] },
    epic:   { permen: [10, 10], hints: [1, 1], shuffles: [1, 1], hammers: [1, 1], bombs: [1, 1] },
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomChestType = () => {
    const r = Math.random();
    if (r < 0.1) return 'epic';
    if (r < 0.4) return 'rare';
    return 'common';
};
const CHEST_CYCLE = ['common','common','rare','common','rare','common','epic'];
const nextChest = (profile,slot) => {
    profile.chestsCreated = (profile.chestsCreated || 0) + 1;
    return { id:`chest-${profile.chestsCreated}-${slot}`,type:CHEST_CYCLE[(profile.chestsCreated-1)%CHEST_CYCLE.length],startTime:Date.now() };
};

export const initChestProfile = (profile) => {
    let p = { ...profile };
    if (!p.chestSlots) p.chestSlots = [null, null, null];
    else p.chestSlots = [...p.chestSlots];
    if (p.chestProgress === undefined) p.chestProgress = 0;
    return p;
};

export const addChestProgress = (profile, points = 1) => {
    let p = initChestProfile(profile);
    
    p.chestProgress += points;
    
    while (p.chestProgress >= CHEST_POINTS_REQUIRED) {
        const emptyIndex = p.chestSlots.findIndex(slot => slot === null);
        if (emptyIndex !== -1) {
            p.chestSlots[emptyIndex] = nextChest(p,emptyIndex);
            p.chestProgress -= CHEST_POINTS_REQUIRED;
        } else {
            // No empty slot, cap so it's ready when a slot opens
            p.chestProgress = CHEST_POINTS_REQUIRED;
            break;
        }
    }
    
    if (p.chestProgress > CHEST_POINTS_REQUIRED) p.chestProgress = CHEST_POINTS_REQUIRED;
    
    return p;
};

export const isChestReady = (chest, now = Date.now()) => {
    if (!chest) return false;
    const cfg = CHEST_TYPES[chest.type];
    if (!cfg) return true;
    return now - chest.startTime >= cfg.durationMs;
};

// Returns { profile, rewards }. rewards === null when the chest is not ready yet.
export const openChestAction = (profile, slotIndex) => {
    let p = { ...profile };
    p.chestSlots = [...(p.chestSlots || [null, null, null])];
    const chest = p.chestSlots[slotIndex];
    if (!chest) return { profile: p, rewards: {error:'CHEST_NOT_FOUND'} };

    if (!isChestReady(chest)) {
        return { profile: p, rewards: null };
    }

    const type = chest.type;
    const table = CHEST_REWARDS[type] || CHEST_REWARDS.common;
    const rewards = { chestType: type };
    
    rewards.permen = randInt(table.permen[0], table.permen[1]);
    // Keep the unopened chest intact when today's budget cannot fit its reward.
    if (!canReceive(p, rewards.permen)) return { profile: p, rewards: { error: 'DAILY_INCOME_LIMIT' } };
    p = creditIncome(p, rewards.permen);
    const hints = randInt(table.hints[0], table.hints[1]);
    const shuffles = randInt(table.shuffles[0], table.shuffles[1]);
    const hammers = randInt(table.hammers[0], table.hammers[1]);
    const bombs = randInt(table.bombs[0], table.bombs[1]);
    if (hints) rewards.hints = hints;
    if (shuffles) rewards.shuffles = shuffles;
    if (hammers) rewards.hammers = hammers;
    if (bombs) rewards.bombs = bombs;

    // permen is handled by the caller (single authoritative balance), items are stored on the profile
    if (rewards.hints) p.hints = (p.hints ?? 3) + rewards.hints;
    if (rewards.shuffles) p.shuffles = (p.shuffles ?? 3) + rewards.shuffles;
    if (rewards.hammers) p.hammers = (p.hammers ?? 3) + rewards.hammers;
    if (rewards.bombs) p.bombs = (p.bombs ?? 3) + rewards.bombs;

    if (!p.statistics) p.statistics = {};
    p.statistics = { ...p.statistics, totalChestsOpened: (p.statistics.totalChestsOpened || 0) + 1 };

    p.chestSlots[slotIndex] = null;

    // slot fill if pending
    if (p.chestProgress >= CHEST_POINTS_REQUIRED) {
        p.chestSlots[slotIndex] = nextChest(p,slotIndex);
        p.chestProgress -= CHEST_POINTS_REQUIRED;
    }

    return { profile: p, rewards };
};

// Permen cost to instantly finish a chest timer: 1 permen per 6 remaining minutes (min 1).
export const calculateDynamicSpeedUpCost = (chestType, startTime, now = Date.now()) => {
    const config = CHEST_TYPES[chestType];
    if (!config) return 0;
    const passed = now - startTime;
    const remaining = Math.max(0, config.durationMs - passed);
    if (remaining <= 0) return 0;
    
    const minutesRemaining = Math.ceil(remaining / 60000);
    return Math.max(1, Math.ceil(minutesRemaining / 6));
};

// Returns { profile, success, cost }. Caller deducts `cost` from the permen balance.
export const speedUpChestAction = (profile, slotIndex, permenBalance) => {
    let p = { ...profile };
    p.chestSlots = [...(p.chestSlots || [null, null, null])];
    const chest = p.chestSlots[slotIndex];
    if (!chest) return { profile: p, success: false, cost: 0 };

    const typeConfig = CHEST_TYPES[chest.type];
    const cost = calculateDynamicSpeedUpCost(chest.type, chest.startTime);
    if (cost === 0) return { profile: p, success: false, cost: 0 };
    
    if (permenBalance === undefined || permenBalance >= cost) {
        p.chestSlots[slotIndex] = {
            ...chest,
            startTime: Date.now() - typeConfig.durationMs - 1000 
        };
        return { profile: p, success: true, cost };
    }
    
    return { profile: p, success: false, cost };
};
