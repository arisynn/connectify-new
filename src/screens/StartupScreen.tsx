import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../GameContext';
import { useAudio } from '../core/audio/AudioEngine';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { Volume2, VolumeX } from 'lucide-react';
import { CDEAuth } from '../core/cde/auth/CDEAuth';
import { useProfile } from '../core/profile/ProfileContext';

export const StartupScreen = () => {
  const { navigate, updateUsername } = useGame();
  const { refreshProfileFromEngine } = useProfile();
  const { settings, updateSettings, playUiClick, playMenuBgm } = useAudio();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Fade out and remove the static HTML loader
    const loader = document.getElementById('static-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.remove();
      }, 300);
    }
  }, []);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't trigger if tapping the mute button
    if ((e.target as HTMLElement).closest('.mute-toggle')) return;
    if (isLeaving) return;

    setIsLeaving(true);
    
    // Unlock AudioContext and play theme music
    if (!settings.muteSfx) playUiClick();
    if (!settings.muteMusic) playMenuBgm();

    // Initialize state / sync profile
    if ((window as any).setStartupComplete) {
      (window as any).setStartupComplete(true);
    }
    refreshProfileFromEngine();
    
    const loggedInUser = CDEAuth.getLoggedInUser();
    if (loggedInUser) {
       updateUsername(loggedInUser);
    }
    
    // Navigate home
    setTimeout(() => {
      navigate('home');
    }, 300); // Wait for crossfade
  };

  const isMuted = settings.muteMusic || settings.muteSfx;
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings({ 
       muteMusic: !isMuted, 
       muteSfx: !isMuted 
    });
  };

  return (
    <motion.div 
      data-testid="startup-play"
      role="button"
      tabIndex={0}
      aria-label="Ketuk untuk bermain"
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleTap(e as any);}}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-[100] bg-[var(--club-paper)] flex flex-col items-center justify-center p-6 cursor-pointer text-[var(--club-ink)]"
      onClick={handleTap}
      onTouchEnd={handleTap}
    >
      {/* Floating Logo */}
      <motion.div 
        animate={{ 
          y: [0, -6, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="z-10 flex flex-col items-center mb-10"
      >
        <div data-testid="startup-brand" className="w-52 aspect-square sm:w-64 mb-4 relative pointer-events-none">
           <DynamicIcon name="connectify_logo" type="logo" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <span className="text-[10px] font-bold tracking-[2px] text-[var(--club-muted)] uppercase block">CONNECTIFY CLUB</span>
        <h1 className="font-['Fredoka'] font-semibold text-3xl text-[var(--club-ink)]">Connectify</h1>
      </motion.div>

      {/* Tap to Play text */}
      <motion.div 
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="z-10 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-full px-8 py-3.5 shadow-[4px_4px_0_var(--club-line)] pointer-events-none"
      >
        <h2 className="font-['Fredoka'] font-semibold text-[var(--club-ink)] text-lg tracking-wider uppercase">
          Ketuk Untuk Bermain
        </h2>
      </motion.div>

      {/* Footer controls & info */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="text-[var(--club-muted)] font-bold text-xs bg-[var(--club-card)] px-3 py-1 rounded-full shadow-[2px_2px_0_var(--club-line)] border-2 border-[var(--club-line)]">
          v1.0.0
        </div>
        
        <button 
          data-testid="startup-mute"
          aria-label={isMuted?'Aktifkan suara':'Matikan suara'}
          className="mute-toggle pointer-events-auto round-button"
          onClick={toggleMute}
        >
          {isMuted ? 
            <VolumeX size={20} strokeWidth={2.5} className="text-[#e11d48]" /> : 
            <Volume2 size={20} strokeWidth={2.5} className="text-[var(--club-ink)]" />
          }
        </button>
      </div>
    </motion.div>
  );
};
