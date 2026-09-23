import { MISSION_REWARDS, getTodayKey } from './economy';

const withReward = (m) => ({ ...m, category: m.game, rewardType: 'permen', rewardAmount: MISSION_REWARDS.weekly[m.difficulty] || 8 });

export const MISSION_GAMES = ['onet', 'block', 'memory', 'triple', 'star'];

export const WEEKLY_MISSIONS_POOL = [
    // Onet
    { id: 'w_split_tiles', type: 'split', game: 'onet', title: 'Lapisan Kejutan', desc: 'Pecahkan 20 pasangan tile gabungan di Onet.', target: 20, difficulty: 'Menengah' },
    { id: 'w_combo_med', type: 'combo', game: 'onet', title: 'Rantai Sempurna', desc: 'Capai Combo x15 dalam satu level Onet.', target: 15, difficulty: 'Menengah' },
    { id: 'w_combo_hard', type: 'combo', game: 'onet', title: 'Dewa Kombinasi', desc: 'Capai Combo x25 dalam satu level Onet.', target: 25, difficulty: 'Sulit' },
    { id: 'w_combo_epic', type: 'combo', game: 'onet', title: 'Legenda Kombinasi', desc: 'Capai Combo x35 dalam satu level Onet.', target: 35, difficulty: 'Sangat Sulit' },
    { id: 'w_flawless_med', type: 'flawless', game: 'onet', title: 'Langkah Akurat', desc: 'Selesaikan 10 level Onet tanpa salah (Flawless).', target: 10, difficulty: 'Menengah' },
    { id: 'w_flawless_hard', type: 'flawless', game: 'onet', title: 'Dewa Presisi', desc: 'Selesaikan 20 level Onet tanpa salah (Flawless).', target: 20, difficulty: 'Sulit' },
    { id: 'w_fastclear_med', type: 'fast_clear', game: 'onet', title: 'Meteor', desc: 'Selesaikan 15 level Onet di bawah 45 detik.', target: 15, difficulty: 'Menengah' },
    { id: 'w_survivor_hard', type: 'survivor', game: 'onet', title: 'Penguasa Waktu', desc: 'Selesaikan 20 level Onet dengan sisa waktu > 50%.', target: 20, difficulty: 'Sulit' },
    { id: 'w_clear_med', type: 'clear', game: 'onet', title: 'Maraton Mingguan', desc: 'Selesaikan 25 level Onet.', target: 25, difficulty: 'Menengah' },
    { id: 'w_clear_hard', type: 'clear', game: 'onet', title: 'Pejuang Tiada Henti', desc: 'Selesaikan 40 level Onet.', target: 40, difficulty: 'Sulit' },
    { id: 'w_score_med', type: 'score', game: 'onet', title: 'Tumpukan Skor', desc: 'Kumpulkan 30.000 skor di Onet.', target: 30000, difficulty: 'Menengah' },
    { id: 'w_score_hard', type: 'score', game: 'onet', title: 'Skor Tak Terbatas', desc: 'Kumpulkan 60.000 skor di Onet.', target: 60000, difficulty: 'Sulit' },
    // Block Puzzle
    { id: 'w_infinity_rounds', type: 'infinityRound', game: 'block', title: 'Jangan Kehabisan Ide', desc: 'Tuntaskan 3 ronde Block Infinity.', target: 3, difficulty: 'Menengah' },
    { id: 'w_block_lines', type: 'blockLines', game: 'block', title: 'Ruang untuk Kombo', desc: 'Bersihkan 25 baris atau kolom di Block Puzzle.', target: 25, difficulty: 'Menengah' },
    { id: 'w_block_clear', type: 'clear', game: 'block', title: 'Fondasi Kuat', desc: 'Selesaikan 8 level Block Puzzle.', target: 8, difficulty: 'Sulit' },
    // Memory Flip
    { id: 'w_memory_pairs', type: 'memoryPairs', game: 'memory', title: 'Memori Pekan Ini', desc: 'Temukan 40 pasangan Memory Flip sepanjang minggu.', target: 40, difficulty: 'Menengah' },
    { id: 'w_memory_combo', type: 'memoryCombo', game: 'memory', title: 'Enam Tanpa Putus', desc: 'Raih 6 pasangan berturut-turut di Memory Flip.', target: 6, difficulty: 'Menengah' },
    { id: 'w_memory_wins', type: 'memoryWin', game: 'memory', title: 'Ingatan Konsisten', desc: 'Menangkan 5 ronde Memory Flip.', target: 5, difficulty: 'Sulit' },
    // Triple Match
    { id: 'w_triple_trios', type: 'tripleTrios', game: 'triple', title: 'Racikan Mingguan', desc: 'Satukan 36 trio di Triple Match.', target: 36, difficulty: 'Menengah' },
    { id: 'w_triple_wins', type: 'tripleWin', game: 'triple', title: 'Tiga Serangkai Sejati', desc: 'Menangkan 5 ronde Triple Match.', target: 5, difficulty: 'Sulit' },
    // Infinity
    { id: 'w_star_kills', type: 'starKills', game: 'star', title: 'Patroli Sepekan', desc: 'Kalahkan 100 musuh di Infinity.', target: 100, difficulty: 'Menengah' },
    { id: 'w_star_bosses', type: 'starBosses', game: 'star', title: 'Pemburu Boss', desc: 'Kalahkan 3 boss Infinity.', target: 3, difficulty: 'Sulit' },
].map(withReward);

const WEEKLY_PER_GAME = { onet: 2, block: 1, memory: 1, triple: 1, star: 1 };

// Engine-independent Fisher-Yates shuffle (Array.sort with a random comparator differs between JS engines).
export const shuffleDeterministic = (arr, rng) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

export const seededRng = (seedStr) => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) hash = Math.imul(31, hash) + seedStr.charCodeAt(i) | 0;
    return () => {
        hash = Math.imul(hash ^ (hash >>> 15), 1 | hash);
        hash ^= hash + Math.imul(hash ^ (hash >>> 7), 61 | hash);
        return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
    };
};

// Picks `perGame[game]` missions per game with distinct types, deterministic for the period seed.
export const pickPerGame = (pool, rng, perGame, maxRank, ranks) => {
    const selected = [];
    for (const game of MISSION_GAMES) {
        const used = new Set();
        const candidates = shuffleDeterministic(pool.filter(m => m.game === game && ranks[m.difficulty] <= maxRank), rng);
        for (const m of candidates) {
            if (selected.filter(x => x.game === game).length >= perGame[game]) break;
            if (used.has(m.type)) continue;
            used.add(m.type); selected.push(m);
        }
    }
    return selected;
};

export const getWeekNumber = function(d) {
    d = new Date(getTodayKey(d.getTime()) + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + '-W' + weekNo;
};

export const generateWeeklyMissions = function(profile) {
    const highestLevel = profile?.highestLevel || 1;
    const playerDiff = highestLevel >= 15 ? 'Sangat Sulit' : highestLevel >= 5 ? 'Sulit' : 'Menengah';
    const ranks = { Menengah: 1, Sulit: 2, 'Sangat Sulit': 3 };
    return pickPerGame(WEEKLY_MISSIONS_POOL, seededRng(getWeekNumber(new Date())), WEEKLY_PER_GAME, ranks[playerDiff], ranks);
};
