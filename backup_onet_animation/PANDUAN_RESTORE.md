# Panduan Backup & Restore Animasi Connect Game Onet

Dokumen ini berisi informasi lokasi file backup dan cara mengembalikannya (restore) setelah kamu melakukan `git pull` dari repository GitHub.

---

## 📁 Daftar File Backup

1. **`/backup_onet_animation/OnetBoard.tsx`**
   - File utuh komponen `OnetBoard` saat ini yang berisi seluruh logika SVG Connect Line, Ring Pulse, dan Tile Matching Animation.

2. **`/backup_onet_animation/ConnectAnimationSnippet.tsx`**
   - Berisi potongan kode modular: fungsi kalkulasi koordinat dan kurva (`getStartSide`, `generateRingPath`, `generateRoundedPath`), komponen SVG layer `<ConnectAnimationLayer />`, dan konfigurasi motion tile.

3. **`/backup_onet_animation/useOnetGame_animation_logic.ts`**
   - Dokumentasi konstanta timing animasi (600ms total duration, 100ms ring A, 180ms line travel, 280ms ring B, 380ms tile shrink).

4. **`/src/game/components/OnetBoard.backup.tsx`**
   - Salinan langsung yang ditaruh di folder komponen `src/game/components/`, aman dan tidak akan terhapus otomatis saat pull.

---

## 🛠 Cara Mengembalikan (Restore) Setelah Git Pull

Jika setelah kamu `git pull` dari GitHub animasi connect yang baru ternyata tidak cocok dan ingin memakai animasi yang ini lagi:

### Opsi 1: Restore File Penuh (Paling Mudah)
Cukup copy kembali file `OnetBoard.tsx`:
```bash
cp backup_onet_animation/OnetBoard.tsx src/game/components/OnetBoard.tsx
```
Atau jika dari file backup yang ada di folder components:
```bash
cp src/game/components/OnetBoard.backup.tsx src/game/components/OnetBoard.tsx
```

### Opsi 2: Restore Khusus Bagian Animasi Saja
Jika di repo terbaru ada fitur-fitur baru pada `OnetBoard.tsx` yang ingin tetap dipertahankan, kamu cukup mengganti bagian:
1. Fungsi bantuan kurva:
   - `getStartSide`
   - `generateRingPath`
   - `generateRoundedPath`
2. Bagian `{/* SVG Path Layer */}` di dalam JSX:
   - Salin blok `<svg ...> ... </svg>` dari file `/backup_onet_animation/ConnectAnimationSnippet.tsx`.
3. Properti animasi pada tile `<motion.button>`:
   - Atribut `animate` dan `transition` pada tile button.
4. Di file `src/game/hooks/useOnetGame.ts`:
   - Pastikan timeout hapus tile berdurasi `600` ms (`setTimeout(..., 600)`).
