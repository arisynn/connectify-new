/**
 * BACKUP: Logic Timing & State Connect Animation di useOnetGame.ts
 * 
 * Bagian ini mengontrol kapan animasi koneksi dipicu dan berapa lama tampil di layar:
 * - activePaths: array path yang sedang digambar
 * - matchingTiles: array tile {r, c} yang sedang memainkan animasi match
 * - Durasi total: 600ms (timeout sebelum tile dihapus dan activePaths dibersihkan)
 */

export const ONET_ANIMATION_TIMINGS = {
    // Total durasi garis koneksi tampil sebelum tile lenyap dari papan
    PATH_DISPLAY_DURATION_MS: 600,
    
    // Timing delay animasi per komponen (sinkron dengan SVG & CSS Motion)
    RING_A_DRAW_DURATION: 0.1,         // Ring pertama menggambar outline (0 - 100ms)
    MAIN_LINE_DELAY: 0.1,              // Garis meluncur setelah 100ms
    MAIN_LINE_DURATION: 0.18,          // Garis meluncur selama 180ms
    RING_B_DELAY: 0.28,                // Ring kedua menggambar outline di tile tujuan (280ms)
    RING_B_DURATION: 0.1,              // Ring kedua menggambar outline selama 100ms
    TILE_DISAPPEAR_DELAY: 0.38,        // Tile mulai menyusut dan garis fade out (380ms)
    TILE_DISAPPEAR_DURATION: 0.2,      // Tile menyusut selama 200ms (380ms + 200ms = 580ms ~ 600ms)
    RING_PULSE_DURATION: 0.58,         // Total efek ring membesar dan memudar
    
    // Error shake duration
    DIRECTION_ERROR_DURATION_MS: 500,
    // Combo popup float duration
    COMBO_FLOAT_DURATION_MS: 600
};

/**
 * Cuplikan kode penanganan match di useOnetGame.ts:
 * 
 * const pathId = pathIdCounter.current++;
 * setActivePaths(prev => [...prev, { id: pathId, path: result.path }]);
 * 
 * const s_r = selected.r;
 * const s_c = selected.c;
 * 
 * setMatchingTiles(prev => [...prev, {r: s_r, c: s_c}, {r, c}]);
 * setSelected(null); // Lepas seleksi langsung agar responsif
 * 
 * setTimeout(() => {
 *     // Hapus tile dari board
 *     setBoard(prev => {
 *         const next = prev.map(row => [...row]);
 *         next[r][c] = 0;
 *         next[s_r][s_c] = 0;
 *         return next;
 *     });
 * 
 *     // Bersihkan path dan matching state
 *     setActivePaths(prev => prev.filter(p => p.id !== pathId));
 *     setMatchingTiles(prev => prev.filter(t => !(t.r === s_r && t.c === s_c) && !(t.r === r && t.c === c)));
 * }, 600);
 */
