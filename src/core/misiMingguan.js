import { MISSION_REWARDS, getTodayKey } from './economy';

const withReward = (m) => ({ ...m, rewardType: 'permen', rewardAmount: MISSION_REWARDS.weekly[m.difficulty] || 8 });

export const WEEKLY_MISSIONS_POOL = [
    {id:'w_memory_pairs',type:'memoryPairs',category:'memory',title:'Memori Pekan Ini',desc:'Temukan 40 pasangan Memory Flip sepanjang minggu.',target:40,difficulty:'Menengah'},
    {id:'w_memory_combo',type:'memoryCombo',category:'memory',title:'Enam Tanpa Putus',desc:'Raih 6 pasangan berturut-turut di Memory Flip.',target:6,difficulty:'Menengah'},
    {id:'w_triple_trios',type:'tripleTrios',category:'triple',title:'Racikan Mingguan',desc:'Satukan 36 trio di Triple Match.',target:36,difficulty:'Menengah'},
    {id:'w_fruit_merges',type:'fruitMerges',category:'fruit',title:'Panen Sepekan',desc:'Gabungkan 120 buah di Fruit Merge sepanjang minggu.',target:120,difficulty:'Menengah'},
    {id:'w_fruit_stage',type:'fruitStage',category:'fruit',title:'Sampai Nanas',desc:'Capai buah tingkat 10 (Nanas) dalam satu ronde Fruit Merge.',target:10,difficulty:'Sulit'},
    {id:'w_fruit_watermelon',type:'fruitWatermelon',category:'fruit',title:'Semangka Perdana',desc:'Bentuk 1 semangka di Fruit Merge.',target:1,difficulty:'Sangat Sulit'},
    {id:'w_infinity_rounds',type:'infinityRound',category:'block',title:'Jangan Kehabisan Ide',desc:'Tuntaskan 3 ronde Block Infinity.',target:3,difficulty:'Menengah'},
    { id: 'w_block_lines', type: 'blockLines', category: 'block', title: 'Ruang untuk Kombo', desc: 'Bersihkan 25 baris atau kolom di Block Puzzle.', target: 25, difficulty: 'Menengah' },
    { id: 'w_split_tiles', type: 'split', category: 'discovery', title: 'Lapisan Kejutan', desc: 'Pecahkan 20 pasangan tile gabungan di Onet.', target: 20, difficulty: 'Menengah' },
    { id: 'w_arcade_wins', type: 'minigame', category: 'discovery', title: 'Keliling Klub', desc: 'Menangkan 5 ronde Memory Flip atau Triple Match.', target: 5, difficulty: 'Menengah' },
    // Consistency (Meta)
    { id: "w_daily_med", type: "complete_daily", category: "consistency", title: "Rajin Banget Mainnya", desc: "Selesaikan 15 Misi Harian minggu ini.", target: 15, difficulty: "Menengah" },
    { id: "w_daily_hard", type: "complete_daily", category: "consistency", title: "Kamu Paling Setia", desc: "Selesaikan 20 Misi Harian minggu ini.", target: 20, difficulty: "Sulit" },
    { id: "w_daily_all_med", type: "complete_daily_all", category: "consistency", title: "Dedikasi Tiada Henti", desc: "Klaim 3 Bonus Harian (Selesaikan semua misi dalam sehari).", target: 3, difficulty: "Menengah" },
    { id: "w_daily_all_hard", type: "complete_daily_all", category: "consistency", title: "Dedikasi Mutlak", desc: "Klaim 5 Bonus Harian (Selesaikan semua misi dalam sehari).", target: 5, difficulty: "Sangat Sulit" },

    // Skill Peak (One-time high achievement)
    { id: "w_combo_med", type: "combo", category: "skill_peak", title: "Rantai Sempurna", desc: "Capai Combo x15 dalam satu level.", target: 15, difficulty: "Menengah" },
    { id: "w_combo_hard", type: "combo", category: "skill_peak", title: "Dewa Kombinasi", desc: "Capai Combo x25 dalam satu level.", target: 25, difficulty: "Sulit" },
    { id: "w_combo_epic", type: "combo", category: "skill_peak", title: "Legenda Kombinasi", desc: "Capai Combo x35 dalam satu level.", target: 35, difficulty: "Sangat Sulit" },

    // Skill & Speed Consistency
    { id: "w_flawless_med", type: "flawless", category: "skill_consistency", title: "Langkah Akurat", desc: "Selesaikan 10 level tanpa salah (Flawless).", target: 10, difficulty: "Menengah" },
    { id: "w_flawless_hard", type: "flawless", category: "skill_consistency", title: "Dewa Presisi", desc: "Selesaikan 20 level tanpa salah (Flawless).", target: 20, difficulty: "Sulit" },
    { id: "w_fastclear_med", type: "fast_clear", category: "skill_consistency", title: "Meteor", desc: "Selesaikan 15 level di bawah 45 detik.", target: 15, difficulty: "Menengah" },
    { id: "w_survivor_hard", type: "survivor", category: "skill_consistency", title: "Penguasa Waktu", desc: "Selesaikan 20 level dengan sisa waktu > 50%.", target: 20, difficulty: "Sulit" },

    // Progression
    { id: "w_clear_med", type: "clear", category: "progression", title: "Maraton Mingguan", desc: "Selesaikan 25 level.", target: 25, difficulty: "Menengah" },
    { id: "w_clear_hard", type: "clear", category: "progression", title: "Pejuang Tiada Henti", desc: "Selesaikan 40 level.", target: 40, difficulty: "Sulit" },
    { id: "w_score_med", type: "score", category: "progression", title: "Tumpukan Skor", desc: "Kumpulkan 30.000 skor.", target: 30000, difficulty: "Menengah" },
    { id: "w_score_hard", type: "score", category: "progression", title: "Skor Tak Terbatas", desc: "Kumpulkan 60.000 skor.", target: 60000, difficulty: "Sulit" },

    // Economy & Feature
    { id: "w_chest_med", type: "openChest", category: "economy", title: "Pemburu Harta Karun", desc: "Buka 15 Peti.", target: 15, difficulty: "Menengah" },
    { id: "w_chest_hard", type: "openChest", category: "economy", title: "Raja Harta Karun", desc: "Buka 25 Peti.", target: 25, difficulty: "Sulit" },
].map(withReward);


// Engine-independent Fisher-Yates shuffle (Array.sort with a random comparator differs between JS engines).
const shuffleDeterministic = (arr, rng) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

export const getWeekNumber = function(d) {
    d = new Date(getTodayKey(d.getTime()) + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return d.getUTCFullYear() + "-W" + weekNo;
};

export const generateWeeklyMissions = function(profile) {
    const highestLevel = profile?.highestLevel || 1;
    let playerDiff = "Menengah";
    if (highestLevel >= 15) playerDiff = "Sangat Sulit";
    else if (highestLevel >= 5) playerDiff = "Sulit";

    const weekStr = getWeekNumber(new Date());
    let hash = 0;
    for (let i = 0; i < weekStr.length; i++) {
        hash = Math.imul(31, hash) + weekStr.charCodeAt(i) | 0;
    }
    const rng = () => {
        hash = Math.imul(hash ^ (hash >>> 15), 1 | hash);
        hash ^= hash + Math.imul(hash ^ (hash >>> 7), 61 | hash);
        return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
    }

    const slots = [
        ['consistency'],
        ['block'],
        ['memory'],
        ['triple'],
        ['fruit'],
        ['progression'],
        ['skill_peak']
    ];

    const selected = [];
    const usedTypes = new Set();
    
    const diffRanks = { "Menengah": 1, "Sulit": 2, "Sangat Sulit": 3 };
    const playerDiffRank = diffRanks[playerDiff];

    const bestMissionsByType = {};
    for (const m of WEEKLY_MISSIONS_POOL) {
        if (diffRanks[m.difficulty] <= playerDiffRank) {
            if (!bestMissionsByType[m.type] || diffRanks[m.difficulty] > diffRanks[bestMissionsByType[m.type].difficulty]) {
                bestMissionsByType[m.type] = m;
            }
        }
    }
    const validMissions = Object.values(bestMissionsByType);

    for (const slotCategories of slots) {
        let candidates = validMissions.filter(m => slotCategories.includes(m.category) && !usedTypes.has(m.type));
        candidates = shuffleDeterministic(candidates, rng);
        
        if (candidates.length > 0) {
            let picked = candidates[0];
            selected.push(picked);
            usedTypes.add(picked.type);
        } else {
            // Fallback: pick any unused
            let fallbacks = shuffleDeterministic(validMissions.filter(m => !usedTypes.has(m.type)), rng);
            if(fallbacks.length > 0) {
                let picked = fallbacks[0];
                selected.push(picked);
                usedTypes.add(picked.type);
            }
        }
    }
    
    return selected;
};
