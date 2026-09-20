import React from 'react';
import { GameProvider, useGame } from './GameContext';
import { MainLobby } from './MainLobby';
import { DestinationScreen } from './DestinationScreen';
import { StartupScreen } from './screens/StartupScreen';
import { LoginScreen } from './screens/LoginScreen';
import { BootScreen } from './screens/BootScreen';

import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './core/theme/ThemeProvider';
import { AudioProvider } from './core/audio/AudioEngine';
import { ProfileProvider } from './core/profile/ProfileContext';
import { CDEProvider } from './core/cde';
import { hasPublicAuth } from './lib/supabase';
import { MobileNav } from './components/MobileNav';
import { useAudio } from './core/audio/AudioEngine';

const GameApp = () => {
  const { screen, navigate } = useGame();
  const audio=useAudio();
  React.useEffect(()=>{if(['boot','login'].includes(screen))audio.stopBgm();else if(['play','block-puzzle','memory','triple','star-patrol','multiplayer'].includes(screen))audio.playGameBgm();else audio.playMenuBgm();},[screen,audio.playMenuBgm,audio.playGameBgm,audio.stopBgm]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
       (window as any)._loaderReady = true;
    }
  }, []);

  return (
    <div 
      data-screen={screen}
      className="app-stage relative w-full h-[100dvh] bg-theme-bg-main bg-[image:var(--asset-bg-global)] bg-cover bg-center overflow-hidden flex flex-col font-sans selection:bg-theme-primary-coral-pink/30"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
    >
       <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col">
           <AnimatePresence mode="wait">
             {screen === 'boot' && <BootScreen key="boot" />}
             {screen === 'startup' && <StartupScreen key="startup" />}
             {screen === 'login' && <LoginScreen key="login" />}
           </AnimatePresence>
           
           {/* Other screens are managed here or inside MainLobby */}
           {screen !== 'boot' && screen !== 'startup' && screen !== 'login' && (
             <>
               {screen === 'home' && <MainLobby />}
               
               <DestinationScreen />
             </>
           )}
       </div>
       <MobileNav/>
    </div>
  );
};

export default function App() {
  if (!import.meta.env.DEV && !hasPublicAuth) return <main className="min-h-dvh flex flex-col items-center justify-center bg-slate-950 text-white text-center p-8 gap-5" data-testid="configuration-required"><h1 className="text-3xl font-bold">Connectify sedang dipersiapkan.</h1><p data-testid="configuration-message">Koneksi akun publik belum aktif. Silakan kembali setelah konfigurasi selesai.</p></main>;
  return (
    <ProfileProvider>
      <CDEProvider>
        <ThemeProvider>
           <AudioProvider>
             <GameProvider>
                 <GameApp />
             </GameProvider>
           </AudioProvider>
        </ThemeProvider>
      </CDEProvider>
    </ProfileProvider>
  );
}
