import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, Palette, Check, Lock, Candy, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KineticButton, CurrencyPill } from '../designs/KineticComponents';
import { KineticDialog, KineticModal } from '../designs/KineticPopups';
import { useTheme } from '../core/theme/ThemeProvider';
import { useProfile } from '../core/profile/ProfileContext';

const ThemeCard = ({ 
  title, 
  state, 
  price,
  color1, 
  color2,
  onEquip,
  onBuy
}: { 
  title: string, 
  state: 'equipped' | 'unlocked' | 'locked', 
  price: number,
  color1: string, 
  color2: string,
  onEquip?: () => void,
  onBuy?: () => void
}) => (
  <div className={`bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex flex-col justify-between text-[var(--club-ink)] ${state === 'locked' ? 'opacity-80' : ''}`}>
     <div>
       <div className="w-full h-24 border-2 border-[var(--club-line)] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden shadow-[1px_1px_0_var(--club-line)]" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}>
          {state === 'locked' && (
            <div className="w-10 h-10 bg-white/80 border border-[var(--club-line)] rounded-full flex items-center justify-center text-[var(--club-ink)]">
              <Lock size={20} strokeWidth={2.5} />
            </div>
          )}
          {state === 'equipped' && (
             <div className="absolute top-2 right-2 bg-white border-2 border-[var(--club-line)] rounded-full p-1 shadow-sm">
                <Check size={14} className="text-[#16a34a]" strokeWidth={3} />
             </div>
          )}
       </div>
       <h3 className="font-['Fredoka'] font-semibold text-base text-[var(--club-ink)] text-center mb-3">{title}</h3>
     </div>
     
     {state === 'equipped' && (
       <button disabled className="pop-button w-full py-2 text-xs !shadow-none opacity-50 cursor-default">
         Sedang Dipakai
       </button>
     )}
     {state === 'unlocked' && (
       <button onClick={onEquip} className="pop-button pink w-full py-2 text-xs font-bold">
         Pakai Tema
       </button>
     )}
     {state === 'locked' && (
       <button onClick={onBuy} className="pop-button butter w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5">
          <span>{price}</span> <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-3.5 h-3.5 object-contain" />
       </button>
     )}
  </div>
);

import { useCDE } from '../core/cde';
import { DynamicIcon } from '../components/theme/DynamicIcon';


export const ThemeScreen = () => {
  const { navigate } = useGame();
  const { profile, updateProfile } = useProfile();
  const { activeTheme, setTheme, availableThemes } = useTheme();
  const cde = useCDE();
  
  const [purchaseModal, setPurchaseModal] = useState<{id: string, name: string, price: number} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleBuy = () => {
     if (!purchaseModal) return;
     if (cde.permen >= purchaseModal.price) {
        cde.queueMutation('PURCHASE_ITEM', { itemId: 'theme_' + purchaseModal.id });
        setPurchaseModal(null);
        setShowSuccess(true);
     } else {
        setPurchaseModal(null);
        setShowError(true);
     }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-[var(--club-paper)] z-[100] flex flex-col font-sans text-[var(--club-ink)]"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 z-10 shrink-0 bg-[var(--club-paper)] border-b-2 border-[var(--club-line)]">
        <div className="flex items-center gap-3">
           <button 
              onClick={() => navigate('home')} 
              className="round-button"
              aria-label="Kembali ke lobby"
           >
             <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain" />
           </button>
           <div>
             <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">TAMPILAN</span>
             <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Tema Permainan</h2>
           </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-full shadow-[2px_2px_0_var(--club-line)]">
          <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-4 h-4 object-contain" />
          <span className="font-bold text-xs text-[var(--club-ink)]">{cde.permen}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 pb-12 grid grid-cols-2 gap-3.5 content-start max-w-xl mx-auto w-full">
         {Object.values(availableThemes).map((theme) => {
           const isEquipped = activeTheme.id === theme.id;
           const isUnlocked = profile?.unlockedThemes?.includes(theme.id);
           const state = isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked');

           return (
             <ThemeCard 
               key={theme.id}
               title={theme.name} 
               state={state} 
               price={theme.price}
               color1={theme.colors.bg || theme.colors['bg-main']} 
               color2={theme.colors.primary || theme.colors['primary-coral-pink']} 
               onEquip={() => { setTheme(theme.id); updateProfile({activeTheme:theme.id}); }}
               onBuy={() => setPurchaseModal({ id: theme.id, name: theme.name, price: theme.price })}
             />
           );
         })}
      </div>

      <KineticDialog
        isOpen={purchaseModal !== null}
        onClose={() => setPurchaseModal(null)}
        icon={Palette}
        title="Beli Tema?"
        description={`Kamu akan menukar ${purchaseModal?.price} Permen untuk tema ${purchaseModal?.name}.`}
        primaryAction={{ label: 'Ya, Beli', onClick: handleBuy, colorClass: 'bg-theme-primary-tropical-green' }}
        secondaryAction={{ label: 'Batal', onClick: () => setPurchaseModal(null) }}
      />

      <KineticModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} colorClass="bg-theme-bg-soft-mint" widthClass="w-full max-w-xs" className="text-center pt-8">
        <div className="w-16 h-16 bg-theme-surface-card-white border-theme-base border-theme-border-main rounded-[1rem] mx-auto flex items-center justify-center shadow-theme-sm mb-4">
           <Palette size={32} className="text-theme-primary-coral-pink" strokeWidth={2.5}/>
        </div>
        <h2 className="font-black text-xl text-theme-text-primary uppercase tracking-wide mb-6">Tema Terbuka!</h2>
        <KineticButton onClick={() => setShowSuccess(false)} colorClass="bg-theme-surface-card-white" className="w-full py-3">OK</KineticButton>
      </KineticModal>

      <KineticDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        icon={AlertTriangle}
        title="Permen Kurang"
        description="Maaf, kamu tidak memiliki cukup Permen untuk membeli tema ini."
        primaryAction={{ label: 'Tutup', onClick: () => setShowError(false), colorClass: 'bg-theme-divider-main' }}
      />

      {/* TOAST MODAL */}
      <AnimatePresence>
         {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 left-0 right-0 flex justify-center z-[120] pointer-events-none"
            >
              <div className="bg-theme-primary-navy text-theme-text-white font-bold text-sm px-6 py-3 rounded-full shadow-theme-base border-theme-sm border-theme-border-main">
                {toastMsg}
              </div>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};
