import React, { useMemo, useState } from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, Package, Palette, Box, Trophy, Check, Lock, Search, RefreshCw, Hammer, Bomb, Sparkles, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { useProfile } from '../core/profile/ProfileContext';
import { useTheme } from '../core/theme/ThemeProvider';
import { useAudio } from '../core/audio/AudioEngine';
import { KineticButton, ProgressBar } from '../designs/KineticComponents';
import { ACHIEVEMENTS_DATA, getCurrentTier } from '../core/achievements';
import { CHEST_TYPES } from '../core/chest';
import { AVATARS, isAvatarUnlocked } from '../core/avatars';
import { AvatarGallery } from '../components/AvatarGallery';
import { TileGallery } from '../components/TileGallery';

const ALL_AVATARS = AVATARS.map(a=>a.id);

const SectionTitle = ({ icon: Icon, title, count, colorClass }: { icon: any, title: string, count: string, colorClass: string }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shadow-[2px_2px_0_var(--club-line)]">
        <Icon size={16} className="text-[var(--club-ink)]" strokeWidth={2.5} />
      </div>
      <h3 className="font-['Fredoka'] font-semibold text-base text-[var(--club-ink)]">{title}</h3>
    </div>
    <span className="font-bold text-xs text-[var(--club-muted)] bg-[var(--club-card)] border border-[var(--club-line)] rounded-full px-2.5 py-0.5">{count}</span>
  </div>
);

export const CollectionScreen = () => {
  const { navigate } = useGame();
  const { profile, updateProfile } = useProfile();
  const { activeTheme, setTheme, availableThemes } = useTheme();
  const audio = useAudio();
  const [section, setSection] = useState<'avatar' | 'tema' | 'lencana' | 'item'>('avatar');

  const themes = Object.values(availableThemes);
  const unlockedThemes: string[] = profile?.unlockedThemes || ['sweets'];
  const avatarsOwned = AVATARS.filter(a=>isAvatarUnlocked(profile,a)).map(a=>a.id);

  const badges = useMemo(() => ACHIEVEMENTS_DATA.map(a => {
    const tier = getCurrentTier(profile, a.id);
    return { id: a.id, title: a.title, category: a.category, tier, total: a.tiers.length };
  }), [profile]);
  const badgesEarned = badges.filter(b => b.tier > 0).length;

  const items = [
    { id: 'hint', label: 'Hint', count: profile?.hints ?? 0, icon: Search, iconName: 'hint', colorClass: 'bg-blue-100' },
    { id: 'shuffle', label: 'Shuffle', count: profile?.shuffles ?? 0, icon: RefreshCw, iconName: 'shuffle', colorClass: 'bg-orange-100' },
    { id: 'hammer', label: 'Hammer', count: profile?.hammers ?? 0, icon: Hammer, colorClass: 'bg-amber-100' },
    { id: 'bomb', label: 'Bomb', count: profile?.bombs ?? 0, icon: Bomb, colorClass: 'bg-red-100' },
  ];

  const totalUnlocked = avatarsOwned.length + unlockedThemes.length + badgesEarned;
  const totalPossible = ALL_AVATARS.length + themes.length + ACHIEVEMENTS_DATA.length;

  const handleEquipTheme = (id: string) => {
    audio.playUiClick();
    setTheme(id);
    updateProfile({ activeTheme: id });
  };

  const handleEquipAvatar = (id: string) => {
    audio.playUiClick();
    updateProfile({ activeAvatarId: id, avatar: id });
  };

  const tabs = [
    { id: 'avatar', label: 'Avatar', icon: UserRound },
    { id: 'tema', label: 'Tema', icon: Palette },
    { id: 'lencana', label: 'Lencana', icon: Trophy },
    { id: 'item', label: 'Item', icon: Package },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-[var(--club-paper)] z-[110] flex flex-col font-sans text-[var(--club-ink)]"
      data-testid="collection-screen"
    >
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0 bg-[var(--club-paper)] border-b-2 border-[var(--club-line)] z-10">
        <button
          data-testid="collection-back-button"
          onClick={() => navigate('home')}
          className="round-button"
          aria-label="Kembali ke lobby"
        >
          <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain" />
        </button>
        <div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">INVENTARIS</span>
          <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Koleksi Anda</h2>
        </div>
      </div>

      {/* Overview */}
      <div className="px-5 pt-4 shrink-0 max-w-xl mx-auto w-full">
        <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0_var(--club-line)]">
            <DynamicIcon name="collection" type="logo" LucideFallback={Package} className="w-7 h-7 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-xs text-[var(--club-muted)] uppercase tracking-wider">Koleksi Terbuka</span>
              <span className="font-['Fredoka'] font-semibold text-sm text-[var(--club-ink)]" data-testid="collection-summary">{totalUnlocked} / {totalPossible}</span>
            </div>
            <div className="w-full bg-[var(--club-paper)] border border-[var(--club-line)] rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="bg-[#46b995] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, (totalUnlocked / totalPossible) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="px-5 pt-3 shrink-0 max-w-xl mx-auto w-full">
        <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-1 grid grid-cols-4 gap-1 shadow-[2px_2px_0_var(--club-line)]">
          {tabs.map(t => (
            <button
              key={t.id}
              data-testid={`collection-tab-${t.id}`}
              onClick={() => { audio.playUiClick(); setSection(t.id); }}
              className={`py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1 transition-all ${section === t.id ? 'bg-[var(--club-butter)] border border-[var(--club-line)] text-[var(--club-ink)] shadow-[1px_1px_0_var(--club-line)]' : 'border border-transparent text-[var(--club-muted)] hover:text-[var(--club-ink)]'}`}
            >
              <t.icon size={16} strokeWidth={2.5} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-12 max-w-xl mx-auto w-full">
        {section === 'avatar' && (
          <div>
            <SectionTitle icon={UserRound} title="Avatar Karakter" count={`${avatarsOwned.length}/${ALL_AVATARS.length}`} colorClass="bg-[var(--club-butter)]" />
            <AvatarGallery selected={profile.activeAvatarId||'avatar_male'} onSelect={handleEquipAvatar}/>
          </div>
        )}

        {section === 'tema' && (
          <div>
            <SectionTitle icon={Palette} title="Tema Papan" count={`${unlockedThemes.length}/${themes.length}`} colorClass="bg-[var(--club-card)]" />
            <div className="grid grid-cols-2 gap-3.5">
              {themes.map(theme => {
                const unlocked = unlockedThemes.includes(theme.id);
                const equipped = activeTheme.id === theme.id;
                return (
                  <div key={theme.id} data-testid={`collection-theme-${theme.id}`} className={`bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3.5 shadow-[3px_3px_0_var(--club-line)] flex flex-col justify-between ${!unlocked ? 'opacity-70' : ''}`}>
                    <div>
                      <div className="w-full h-22 border-2 border-[var(--club-line)] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden shadow-[1px_1px_0_var(--club-line)]" style={{ background: `linear-gradient(135deg, ${theme.colors.bg || theme.colors['bg-main']}, ${theme.colors.primary || theme.colors['primary-coral-pink']})` }}>
                        <div className="flex gap-1.5 p-1.5">{Object.values(theme.assets.tiles).slice(0,3).map((src,i)=><img key={i} src={src} alt={`Contoh tile ${theme.name} ${i+1}`} className="w-10 h-10 object-contain bg-white rounded-lg border-2 border-[var(--club-line)] shadow-xs"/>)}</div>
                        {!unlocked && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Lock size={24} className="text-white" /></div>}
                        {equipped && <div className="absolute top-2 right-2 bg-white border-2 border-[var(--club-line)] rounded-full p-1 shadow-sm"><Check size={14} className="text-[#16a34a]" strokeWidth={3} /></div>}
                      </div>
                      <h4 className="font-['Fredoka'] font-semibold text-sm text-[var(--club-ink)] text-center mb-2.5">{theme.name}</h4>
                    </div>
                    {equipped ? (
                      <div className="w-full py-1.5 rounded-xl bg-[var(--club-paper)] border border-[var(--club-line)] flex items-center justify-center gap-1 font-bold text-xs text-[var(--club-muted)]"><Check size={14} strokeWidth={2.5} /> Dipakai</div>
                    ) : unlocked ? (
                      <button data-testid={`collection-equip-${theme.id}`} onClick={() => handleEquipTheme(theme.id)} className="pop-button pink w-full py-1.5 text-xs font-bold">Pakai</button>
                    ) : (
                      <button data-testid={`collection-buy-${theme.id}`} onClick={() => navigate('toko')} className="pop-button butter w-full py-1.5 text-xs font-bold">Beli di Toko</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {section === 'tema' && <TileGallery/>}
        {section === 'lencana' && (
          <div>
            <SectionTitle icon={Trophy} title="Lencana Penghargaan" count={`${badgesEarned}/${badges.length}`} colorClass="bg-[var(--club-butter)]" />
            <div className="grid grid-cols-3 gap-3">
              {badges.map(b => {
                const earned = b.tier > 0;
                const maxed = b.tier >= b.total;
                return (
                  <div key={b.id} data-testid={`collection-badge-${b.id}`} className={`bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3 shadow-[2px_2px_0_var(--club-line)] flex flex-col items-center text-center ${!earned ? 'opacity-50' : ''}`}>
                    <div className={`w-11 h-11 rounded-full border-2 border-[var(--club-line)] flex items-center justify-center mb-2 relative ${maxed ? 'bg-[var(--club-butter)]' : earned ? 'bg-amber-100' : 'bg-[var(--club-paper)]'}`}>
                      {earned ? <Trophy size={18} className="text-[var(--club-ink)]" /> : <Lock size={16} className="text-[var(--club-muted)]" />}
                      {maxed && <Sparkles size={11} className="absolute -top-1 -right-1 text-amber-600" />}
                    </div>
                    <span className="font-bold text-[11px] text-[var(--club-ink)] leading-tight line-clamp-2">{b.title}</span>
                    <span className="font-semibold text-[10px] text-[var(--club-muted)] mt-1">Tier {b.tier}/{b.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {section === 'item' && (
          <div className="flex flex-col gap-5">
            <div>
              <SectionTitle icon={Package} title="Inventaris Booster" count={`${items.reduce((a, i) => a + i.count, 0)} item`} colorClass="bg-[#46b995]" />
              <div className="grid grid-cols-2 gap-3">
                {items.map(it => (
                  <div key={it.id} data-testid={`collection-item-${it.id}`} className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3.5 shadow-[2px_2px_0_var(--club-line)] flex items-center gap-3">
                    <div className="w-11 h-11 bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0">
                      {it.iconName ? <DynamicIcon name={it.iconName} type="logo" LucideFallback={it.icon} className="w-6 h-6 object-contain" /> : <it.icon size={20} className="text-[var(--club-ink)]" />}
                    </div>
                    <div>
                      <span className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-none block">{it.count}</span>
                      <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)]">{it.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle icon={Box} title="Peti Hadiah" count={`${profile?.statistics?.totalChestsOpened || 0} dibuka`} colorClass="bg-[var(--club-butter)]" />
              <div className="grid grid-cols-3 gap-3">
                {(Object.entries(CHEST_TYPES) as [string, { name: string, durationMs: number }][]).map(([id, cfg]) => (
                  <div key={id} className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3 shadow-[2px_2px_0_var(--club-line)] flex flex-col items-center text-center">
                    <DynamicIcon name={`chest_${id}`} type="logo" LucideFallback={Box} className="w-10 h-10 object-contain mb-1" />
                    <span className="font-bold text-[11px] text-[var(--club-ink)] leading-tight">{cfg.name}</span>
                    <span className="font-semibold text-[10px] text-[var(--club-muted)] mt-0.5">{Math.round(cfg.durationMs / 3600000) >= 1 ? `${Math.round(cfg.durationMs / 3600000)} jam` : `${Math.round(cfg.durationMs / 60000)} mnt`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
