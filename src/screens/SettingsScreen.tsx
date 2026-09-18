import React from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, Volume2, VolumeX, Music, LogOut, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { KineticButton } from '../designs/KineticComponents';
import { KineticDialog } from '../designs/KineticPopups';
import { useAudio } from '../core/audio/AudioEngine';
import { useProfile } from '../core/profile/ProfileContext';
import { CDEAuth } from '../core/cde/auth/CDEAuth';
import { CDE } from '../core/cde/CDE';
import { useCDE } from '../core/cde';
import { AccountDataPopup } from './AccountDataPopup';
import { Smartphone, Cloud } from 'lucide-react';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { ModeToggle } from '../components/GameShell';
import { hasPublicAuth } from '../lib/supabase';


export const SettingsScreen = () => {
  const { navigate, resetProgress } = useGame();
  const { settings, updateSettings } = useAudio();
  const { profile, clearProfile } = useProfile();
  const cde = useCDE();

  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showDataPopup, setShowDataPopup] = React.useState(false);

  const [isGeneratingCode, setIsGeneratingCode] = React.useState(false);
  const [recoveryCode, setRecoveryCode] = React.useState('');
  
  const executeReset = async () => {
       const playerName = CDEAuth.getLoggedInUser();
       if (playerName) {
          localStorage.removeItem(`SC_BACKUP_${playerName}`);
          localStorage.removeItem(`sweet_connect_${playerName}`);
       }
       localStorage.removeItem('sweetConnectSave');
       localStorage.removeItem('sweetConnectAudioSettings');
       if (CDE.getState().initialized) {
          await CDE.logout(); // Will clear state
          // Could also clear indexedDB here
       }
       window.location.reload();
  };

  const handleReset = () => {
      setShowResetDialog(true);
  };

  const executeLogout = async () => {
       if (isLoggingOut) return;
       setIsLoggingOut(true);
       try {
           await CDEAuth.logout();
           clearProfile();
           navigate('login');
       } catch (error) {
           console.error("Logout failed:", error);
           navigate('login');
       }
  };

  const handleLogout = () => {
      setShowLogoutDialog(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-[var(--club-paper)] z-[100] flex flex-col font-sans text-[var(--club-ink)]"
    >
      <div className="flex items-center gap-3 px-5 py-3.5 z-10 shrink-0 bg-[var(--club-paper)] border-b-2 border-[var(--club-line)]">
        <button 
           onClick={() => navigate('home')} 
           className="round-button"
           aria-label="Kembali ke lobby"
        >
          <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain" />
        </button>
        <div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">PREFERENSI</span>
          <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Pengaturan</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 max-w-xl mx-auto w-full pb-12">
        
        {/* Appearance Settings */}
        <section className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex items-center justify-between">
          <div>
            <h3 data-testid="appearance-title" className="font-bold text-sm text-[var(--club-ink)]">Tampilan Terang / Gelap</h3>
            <p data-testid="appearance-description" className="text-xs text-[var(--club-muted)] mt-0.5">Menyesuaikan kontras layar.</p>
          </div>
          <ModeToggle id="settings-mode"/>
        </section>

        {/* Audio Settings */}
        <section className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex flex-col gap-3.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--club-muted)]">Pengaturan Audio</h3>
           
           {/* SFX Toggle */}
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-[var(--club-paper)] rounded-xl flex items-center justify-center border-2 border-[var(--club-line)]">
                   {settings.muteSfx ? <VolumeX size={18} className="text-[var(--club-muted)]" /> : <Volume2 size={18} className="text-[#e11d48]" />}
                 </div>
                 <span className="font-bold text-sm text-[var(--club-ink)]">Efek Suara (SFX)</span>
              </div>
              <button 
                onClick={() => updateSettings({ muteSfx: !settings.muteSfx })}
                className={`w-12 h-7 rounded-full border-2 border-[var(--club-line)] relative transition-colors cursor-pointer ${!settings.muteSfx ? 'bg-[#46b995]' : 'bg-[var(--club-paper)]'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white border border-[var(--club-line)] rounded-full absolute top-1"
                  style={{ left: !settings.muteSfx ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                />
              </button>
           </div>

           <div className="h-px w-full bg-[var(--club-line)]/10" />

           {/* Music Toggle */}
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-[var(--club-paper)] rounded-xl flex items-center justify-center border-2 border-[var(--club-line)]">
                   {settings.muteMusic ? <VolumeX size={18} className="text-[var(--club-muted)]" /> : <Music size={18} className="text-[#0284c7]" />}
                 </div>
                 <span className="font-bold text-sm text-[var(--club-ink)]">Musik Latar (BGM)</span>
              </div>
              <button 
                onClick={() => updateSettings({ muteMusic: !settings.muteMusic })}
                className={`w-12 h-7 rounded-full border-2 border-[var(--club-line)] relative transition-colors cursor-pointer ${!settings.muteMusic ? 'bg-[#46b995]' : 'bg-[var(--club-paper)]'}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white border border-[var(--club-line)] rounded-full absolute top-1"
                  style={{ left: !settings.muteMusic ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                />
              </button>
           </div>
        </section>

        {/* Account Settings */}
        <section className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex flex-col gap-3.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--club-muted)]">Akun & Data</h3>
          
          <div
             onClick={() => setShowDataPopup(true)}
             className="bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl p-3.5 shadow-[2px_2px_0_var(--club-line)] cursor-pointer active:translate-y-0.5 transition-all flex flex-col gap-2.5"
          >
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0">
                  <Smartphone size={20} className="text-[var(--club-ink)]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-[var(--club-muted)]">ID Pemain</span>
                  <span className="font-bold text-sm text-[var(--club-ink)] truncate">PLAYER-{profile.id || Math.floor(Math.random() * 1000000)}</span>
                </div>
             </div>
             <div className="h-px w-full bg-[var(--club-line)]/10" />
             <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-1.5 text-[var(--club-muted)]">
                   <Cloud size={14} className={navigator.onLine ? "text-[#16a34a]" : "text-[#e11d48]"} />
                   <span>Status:</span>
                </div>
                <span className={navigator.onLine ? 'text-[#16a34a]' : 'text-[#e11d48]'}>
                   {navigator.onLine ? (hasPublicAuth ? 'Akun terhubung' : 'Pratinjau lokal') : 'Offline'}
                </span>
             </div>
          </div>
          
          <div className="flex flex-col gap-2.5 mt-1">
             <button
                onClick={handleLogout}
                className="pop-button w-full py-2.5 flex items-center justify-center gap-2 font-bold text-xs"
             >
                <LogOut size={16} />
                <span>Keluar dari Akun</span>
             </button>
             <button
                onClick={handleReset}
                className="pop-button pink w-full py-2.5 flex items-center justify-center gap-2 font-bold text-xs"
             >
                <Trash2 size={16} />
                <span>Reset Data Permainan</span>
             </button>
          </div>
        </section>

        <div className="text-center mt-2">
           <p className="font-bold text-[11px] text-[var(--club-muted)]">Connectify Club v1.0.0</p>
        </div>

      </div>

      <KineticDialog 
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Keluar dari Akun?"
        description="Data permainanmu sudah tersimpan dan kamu bisa masuk kembali nanti."
        primaryAction={{ label: 'Keluar', onClick: executeLogout, colorClass: 'bg-theme-game-danger' }}
        secondaryAction={{ label: 'Batal', onClick: () => setShowLogoutDialog(false) }}
      />
      
      <KineticDialog 
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        title="Reset Data?"
        description="Apakah kamu yakin ingin mereset semua data di perangkat ini? Data cloud masih dipertahankan."
        primaryAction={{ label: 'Reset', onClick: executeReset, colorClass: 'bg-theme-game-danger' }}
        secondaryAction={{ label: 'Batal', onClick: () => setShowResetDialog(false) }}
      />
      <AccountDataPopup 
        isOpen={showDataPopup}
        onClose={() => setShowDataPopup(false)}
        onLogout={handleLogout}
        onReset={handleReset}
        profileId={profile.id || Math.floor(Math.random() * 1000000).toString()}
      />
    </motion.div>

  );
};
