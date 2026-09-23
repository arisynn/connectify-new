import { MISSION_REWARDS, getTodayKey, canReceive, creditIncome } from './economy';
import { WEEKLY_MISSIONS_POOL, generateWeeklyMissions, getWeekNumber, MISSION_GAMES, seededRng, pickPerGame } from './misiMingguan';
import { awardXP, missionXP } from './progression.js';

const withReward = (m) => ({ ...m, category: m.game, rewardType: 'permen', rewardAmount: MISSION_REWARDS.daily[m.difficulty] || 5 });

// Every mission belongs to exactly one game. Progress only comes from that game's rounds.
export const DAILY_MISSIONS_POOL = [
    // Onet
    { id: 'd_onet_pairs', type: 'match', game: 'onet', title: 'Ketemu Pasangannya', desc: 'Hubungkan 15 pasangan tile Onet.', target: 15, difficulty: 'Mudah' },
    { id: 'd_onet_split', type: 'split', game: 'onet', title: 'Kejutan di Dalam Tile', desc: 'Pecahkan 6 pasangan tile gabungan di Onet.', target: 6, difficulty: 'Menengah' },
    { id: 'd_clear_easy', type: 'clear', game: 'onet', title: 'Pemanasan', desc: 'Selesaikan 2 level Onet.', target: 2, difficulty: 'Mudah' },
    { id: 'd_clear_med', type: 'clear', game: 'onet', title: 'Makin Jago', desc: 'Selesaikan 4 level Onet.', target: 4, difficulty: 'Menengah' },
    { id: 'd_clear_hard', type: 'clear', game: 'onet', title: 'Hebat Banget Sayang', desc: 'Selesaikan 7 level Onet.', target: 7, difficulty: 'Sulit' },
    { id: 'd_match_med', type: 'match', game: 'onet', title: 'Rajin Bersihin Papan', desc: 'Hubungkan 80 pasangan tile Onet.', target: 80, difficulty: 'Menengah' },
    { id: 'd_match_hard', type: 'match', game: 'onet', title: 'Nggak Ada yang Sisa', desc: 'Hubungkan 150 pasangan tile Onet.', target: 150, difficulty: 'Sulit' },
    { id: 'd_score_easy', type: 'score', game: 'onet', title: 'Dikit-dikit Lama-lama Bukit', desc: 'Kumpulkan 3.000 skor di Onet.', target: 3000, difficulty: 'Mudah' },
    { id: 'd_score_med', type: 'score', game: 'onet', title: 'Poinnya Banyak', desc: 'Kumpulkan 8.000 skor di Onet.', target: 8000, difficulty: 'Menengah' },
    { id: 'd_score_hard', type: 'score', game: 'onet', title: 'Jago Kumpulin Poin', desc: 'Kumpulkan 15.000 skor di Onet.', target: 15000, difficulty: 'Sulit' },
    { id: 'd_combo_easy', type: 'combo', game: 'onet', title: 'Kombo Santai', desc: 'Capai Combo x4 di Onet.', target: 4, difficulty: 'Mudah' },
    { id: 'd_combo_med', type: 'combo', game: 'onet', title: 'Makin Lincah', desc: 'Capai Combo x7 di Onet.', target: 7, difficulty: 'Menengah' },
    { id: 'd_combo_hard', type: 'combo', game: 'onet', title: 'Nggak Ada Matinya', desc: 'Capai Combo x12 di Onet.', target: 12, difficulty: 'Sulit' },
    { id: 'd_flawless_easy', type: 'flawless', game: 'onet', title: 'Pelan Tapi Pasti', desc: 'Selesaikan 1 level Onet tanpa salah (Flawless).', target: 1, difficulty: 'Mudah' },
    { id: 'd_flawless_med', type: 'flawless', game: 'onet', title: 'Fokus Banget', desc: 'Selesaikan 2 level Onet tanpa salah (Flawless).', target: 2, difficulty: 'Menengah' },
    { id: 'd_flawless_hard', type: 'flawless', game: 'onet', title: 'Sempurna!', desc: 'Selesaikan 4 level Onet tanpa salah (Flawless).', target: 4, difficulty: 'Sulit' },
    { id: 'd_survivor_easy', type: 'survivor', game: 'onet', title: 'Santai Aja', desc: 'Selesaikan 1 level dengan sisa waktu > 50%.', target: 1, difficulty: 'Mudah' },
    { id: 'd_survivor_med', type: 'survivor', game: 'onet', title: 'Tenang', desc: 'Selesaikan 2 level dengan sisa waktu > 50%.', target: 2, difficulty: 'Menengah' },
    { id: 'd_fastclear_easy', type: 'fast_clear', game: 'onet', title: 'Sat Set', desc: 'Selesaikan 1 level di bawah 45 detik.', target: 1, difficulty: 'Mudah' },
    { id: 'd_fastclear_med', type: 'fast_clear', game: 'onet', title: 'Cepet Juga', desc: 'Selesaikan 2 level di bawah 45 detik.', target: 2, difficulty: 'Menengah' },
    { id: 'd_hint_easy', type: 'useHint', game: 'onet', title: 'Boleh Pake Bantuan Kok', desc: 'Gunakan Petunjuk 1 kali.', target: 1, difficulty: 'Mudah' },
    { id: 'd_shuffle_easy', type: 'useShuffle', game: 'onet', title: 'Acak-acak Dulu', desc: 'Gunakan Acak 1 kali di Onet.', target: 1, difficulty: 'Mudah' },
    // Block Puzzle
    { id: 'd_block_lines', type: 'blockLines', game: 'block', title: 'Beri Ruang Baru', desc: 'Bersihkan 3 baris atau kolom di Block Puzzle.', target: 3, difficulty: 'Mudah' },
    { id: 'd_block_lines_pro', type: 'blockLines', game: 'block', title: 'Arsitek Balok', desc: 'Bersihkan 8 baris atau kolom di Block Puzzle.', target: 8, difficulty: 'Menengah' },
    { id: 'd_block_win', type: 'clear', game: 'block', title: 'Papan Tuntas', desc: 'Selesaikan 2 level Block Puzzle.', target: 2, difficulty: 'Mudah' },
    { id: 'd_block_score', type: 'score', game: 'block', title: 'Tumpukan Rapi', desc: 'Kumpulkan 2.000 skor di Block Puzzle.', target: 2000, difficulty: 'Menengah' },
    { id: 'd_infinity_round', type: 'infinityRound', game: 'block', title: 'Tanpa Batas', desc: 'Tuntaskan 1 ronde Block Infinity.', target: 1, difficulty: 'Mudah' },
    // Memory Flip
    { id: 'd_memory_pairs', type: 'memoryPairs', game: 'memory', title: 'Tersimpan di Ingatan', desc: 'Temukan 6 pasangan Memory Flip, boleh dari beberapa ronde.', target: 6, difficulty: 'Mudah' },
    { id: 'd_memory_win', type: 'memoryWin', game: 'memory', title: 'Semua Kartu Terbuka', desc: 'Menangkan 1 ronde Memory Flip di kesulitan apa saja.', target: 1, difficulty: 'Mudah' },
    { id: 'd_memory_combo', type: 'memoryCombo', game: 'memory', title: 'Ingatan Beruntun', desc: 'Raih 3 pasangan berturut-turut di Memory Flip.', target: 3, difficulty: 'Menengah' },
    // Triple Match
    { id: 'd_triple_trios', type: 'tripleTrios', game: 'triple', title: 'Tiga Itu Pas', desc: 'Satukan 6 trio di Triple Match, boleh dari beberapa ronde.', target: 6, difficulty: 'Mudah' },
    { id: 'd_triple_win', type: 'tripleWin', game: 'triple', title: 'Papan Tanpa Sisa', desc: 'Menangkan 1 ronde Triple Match.', target: 1, difficulty: 'Menengah' },
    { id: 'd_triple_score', type: 'score', game: 'triple', title: 'Racikan Bernilai', desc: 'Kumpulkan 1.500 skor di Triple Match.', target: 1500, difficulty: 'Mudah' },
    // Infinity
    { id: 'd_star_round', type: 'starRound', game: 'star', title: 'Pilot Bertugas', desc: 'Tuntaskan 1 penerbangan Infinity minimal 5 detik.', target: 1, difficulty: 'Mudah' },
    { id: 'd_star_kills', type: 'starKills', game: 'star', title: 'Langit Aman', desc: 'Kalahkan 15 musuh di Infinity.', target: 15, difficulty: 'Mudah' },
    { id: 'd_star_boss', type: 'starBosses', game: 'star', title: 'Ancaman Terkendali', desc: 'Kalahkan 1 boss Infinity.', target: 1, difficulty: 'Menengah' },
].map(withReward);

export { MISSION_GAMES };
const DAILY_PER_GAME = { onet: 3, block: 2, memory: 2, triple: 2, star: 2 };

export const generateDailyMissions = function(profile) {
    const highestLevel = profile?.highestLevel || 1;
    const playerDiff = highestLevel >= 30 ? 'Sulit' : highestLevel >= 6 ? 'Menengah' : 'Mudah';
    const ranks = { Mudah: 1, Menengah: 2, Sulit: 3 };
    return pickPerGame(DAILY_MISSIONS_POOL, seededRng(getTodayKey()), DAILY_PER_GAME, ranks[playerDiff], ranks);
};

const EVENT_TO_TYPE = {
    winLevel: 'clear', flawless: 'flawless', survivor: 'survivor', fast_clear: 'fast_clear',
    match: 'match', score: 'score', combo: 'combo', useHint: 'useHint', useShuffle: 'useShuffle',
    blockLines: 'blockLines', split: 'split',
    memoryPairs: 'memoryPairs', memoryCombo: 'memoryCombo', memoryWin: 'memoryWin', tripleTrios: 'tripleTrios', tripleWin: 'tripleWin', infinityRound: 'infinityRound',
    starRound: 'starRound', starKills: 'starKills', starBosses: 'starBosses',
};

// "Peak" missions keep the best single value instead of accumulating.
const PEAK_TYPES = new Set(['combo', 'memoryCombo']);

const pushNotification = (p, title, message, type) => {
    if (!p.notifications) p.notifications = [];
    if (p.notifications.some(n => n.title === title && n.message === message && (Date.now() - n.timestamp < 10000))) return;
    p.notifications = [{ id: Date.now().toString() + Math.random().toString(36).substring(2, 9), title, message, type, timestamp: Date.now(), read: false }, ...p.notifications].slice(0, 50);
};

const applyEvent = (missions, type, amount, game) => {
    let changed = false;
    const next = missions.map(m => {
        if (m.type !== type || m.claimed || (game && m.game && m.game !== game)) return m;
        changed = true;
        const progress = PEAK_TYPES.has(type) ? Math.min(Math.max(m.progress || 0, amount), m.target) : Math.min((m.progress || 0) + amount, m.target);
        return { ...m, progress };
    });
    return changed ? next : missions;
};

// Ensures both daily (activeMissions) and weekly (activeWeeklyMissions) sets exist & are current.
export const checkDailyMissions = (profile) => {
    let p = { ...profile };
    const today = getTodayKey();
    p.pendingMissions = [...(p.pendingMissions || [])];
    const archive = (missions, period, scope) => {
        for (const m of missions || []) {
            if (!m.claimed && m.progress >= m.target) {
                const id = `${period}:${m.id}`;
                if (!p.pendingMissions.some(x => x.id === id)) p.pendingMissions.push({ ...m, id, scope, savedFrom: period, rewardAmount: MISSION_REWARDS[scope][m.difficulty] || 5 });
            }
        }
    };
    // Legacy sets (hub-wide or chest missions) are archived once; completed ones stay claimable.
    const legacy = list => (list || []).some(m => !m.game || !MISSION_GAMES.includes(m.game));
    if (!p.activeMissions || p.activeMissions.length === 0 || p.dailyMissionsDate !== today || legacy(p.activeMissions)) {
        archive(p.activeMissions, p.dailyMissionsDate, 'daily');
        p.activeMissions = generateDailyMissions(p).map(m => ({ ...m, progress: 0, claimed: false }));
        p.dailyMissionsDate = today;
        p.dailyBonusClaimed = false;
    }
    const week = getWeekNumber(new Date());
    if (!p.activeWeeklyMissions || p.activeWeeklyMissions.length === 0 || p.weeklyMissionsWeek !== week || legacy(p.activeWeeklyMissions)) {
        archive(p.activeWeeklyMissions, p.weeklyMissionsWeek, 'weekly');
        p.activeWeeklyMissions = generateWeeklyMissions(p).map(m => ({ ...m, progress: 0, claimed: false }));
        p.weeklyMissionsWeek = week;
    }
    p.activeMissions = p.activeMissions.map(m => ({ ...m, rewardAmount: MISSION_REWARDS.daily[m.difficulty] || 5 }));
    p.activeWeeklyMissions = p.activeWeeklyMissions.map(m => ({ ...m, rewardAmount: MISSION_REWARDS.weekly[m.difficulty] || 8 }));
    return p;
};

// `game` scopes the event to that game's missions; omit it for game-agnostic events.
export const updateMissions = (profile, eventType, amount = 1, game) => {
    let p = checkDailyMissions(profile);
    const type = EVENT_TO_TYPE[eventType];
    if (!type) return p;
    const beforeDaily = p.activeMissions, beforeWeekly = p.activeWeeklyMissions;
    p.activeMissions = applyEvent(p.activeMissions, type, amount, game);
    p.activeWeeklyMissions = applyEvent(p.activeWeeklyMissions, type, amount, game);
    const notifyCompleted = (before, after, label) => {
        after.forEach((m, idx) => {
            const prev = before[idx];
            if (prev && (prev.progress || 0) < prev.target && m.progress >= m.target && !m.claimed) pushNotification(p, `${label} Selesai`, `Misi '${m.title}' telah selesai. Klaim hadiahmu!`, 'mission');
        });
    };
    if (beforeDaily !== p.activeMissions) notifyCompleted(beforeDaily, p.activeMissions, 'Misi Harian');
    if (beforeWeekly !== p.activeWeeklyMissions) notifyCompleted(beforeWeekly, p.activeWeeklyMissions, 'Misi Mingguan');
    return p;
};

export const onDailyMissionClaimed = (profile) => {
    const p = { ...profile };
    p.statistics = { ...(p.statistics || {}), totalDailyMissionsCompleted: (p.statistics?.totalDailyMissionsCompleted || 0) + 1 };
    return p;
};

// Finds a mission (daily, weekly or saved) by id.
export const findMission = (profile, missionId) => {
    const daily = profile.activeMissions || [], weekly = profile.activeWeeklyMissions || [], pending = profile.pendingMissions || [];
    let idx = daily.findIndex(m => m.id === missionId);
    if (idx >= 0) return { list: 'activeMissions', index: idx, mission: daily[idx], scope: 'daily' };
    idx = weekly.findIndex(m => m.id === missionId);
    if (idx >= 0) return { list: 'activeWeeklyMissions', index: idx, mission: weekly[idx], scope: 'weekly' };
    idx = pending.findIndex(m => m.id === missionId);
    if (idx >= 0) return { list: 'pendingMissions', index: idx, mission: pending[idx], scope: 'saved' };
    return null;
};

// Pure claim logic shared by client (optimistic) and server (authoritative).
export const claimMissionReward = (profile, missionId) => {
    let p = checkDailyMissions(profile);
    const found = findMission(p, missionId);
    if (!found) return { profile: p, permenDelta: 0, error: 'MISSION_NOT_FOUND' };
    const { list, index, mission, scope } = found;
    if ((mission.progress || 0) < mission.target) return { profile: p, permenDelta: 0, error: 'MISSION_NOT_COMPLETE' };
    if (mission.claimed) return { profile: p, permenDelta: 0, error: 'MISSION_ALREADY_CLAIMED' };
    if (!canReceive(p, mission.rewardAmount)) return { profile: p, permenDelta: 0, error: 'DAILY_INCOME_LIMIT' };
    const missions = [...p[list]];
    missions[index] = { ...mission, claimed: true };
    p[list] = missions;
    const permenDelta = mission.rewardAmount || 0;
    if (scope === 'daily' || (scope === 'saved' && mission.scope === 'daily')) p = onDailyMissionClaimed(p);
    p.statistics = { ...p.statistics, [`${mission.game || 'club'}MissionsClaimed`]: (p.statistics?.[`${mission.game || 'club'}MissionsClaimed`] || 0) + 1 };
    p = creditIncome(p, permenDelta);
    p = awardXP(p, missionXP(mission));
    return { profile: p, permenDelta, error: null };
};

export { WEEKLY_MISSIONS_POOL };
