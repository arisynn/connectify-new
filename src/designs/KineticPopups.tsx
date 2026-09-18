import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { DynamicIcon } from '../components/theme/DynamicIcon';

// --- BASE MODAL/BACKDROP ---
export const KineticBackdrop = ({ children, onClick, isOpen }: { children: React.ReactNode, onClick?: () => void, isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-[3px]"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const KineticCloseButton = ({ onClick, className = "" }: { onClick: () => void, className?: string }) => (
  <motion.button
    data-testid={`dialog-close-${React.useId().replace(/:/g,'')}`}
    aria-label="Tutup dialog"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`absolute top-3.5 right-3.5 w-9 h-9 border-2 border-[var(--club-line)] rounded-full bg-[var(--club-card)] text-[var(--club-ink)] shadow-[2px_2px_0_var(--club-line)] hover:bg-[var(--club-butter)] flex items-center justify-center z-10 transition-colors ${className}`}
  >
    <X size={18} strokeWidth={2.5} />
  </motion.button>
);

export const KineticModal = ({ 
  isOpen, 
  onClose, 
  children,
  className = "",
  colorClass = "bg-[var(--club-card)]",
  widthClass = "w-full max-w-sm"
}: { 
  isOpen: boolean, 
  onClose?: () => void, 
  children: React.ReactNode,
  className?: string,
  colorClass?: string,
  widthClass?: string
}) => (
  <KineticBackdrop isOpen={isOpen} onClick={onClose}>
    <motion.div
      role="dialog"
      aria-modal="true"
      data-testid={`dialog-${React.useId().replace(/:/g,'')}`}
      initial={{ scale: 0.92, y: 16, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.92, y: 16, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 320 }}
      onClick={(e) => e.stopPropagation()}
      className={`relative border-2 border-[var(--club-line)] rounded-[24px] shadow-[5px_5px_0_var(--club-line)] ${colorClass} text-[var(--club-ink)] ${widthClass} p-6 ${className}`}
    >
      {onClose && <KineticCloseButton onClick={onClose} />}
      {children}
    </motion.div>
  </KineticBackdrop>
);

export const KineticBottomSheet = ({
  isOpen,
  onClose,
  children,
  className = "",
  colorClass = "bg-[var(--club-paper)]"
}: {
  isOpen: boolean,
  onClose?: () => void,
  children: React.ReactNode,
  className?: string,
  colorClass?: string
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0f172a]/60 backdrop-blur-[3px]"
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className={`fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--club-line)] rounded-t-[26px] shadow-[0_-4px_0_var(--club-line)] ${colorClass} text-[var(--club-ink)] p-5 pb-8 ${className}`}
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          <div className="w-12 h-1.5 bg-[var(--club-muted)]/30 rounded-full mx-auto mb-4" />
          {onClose && <KineticCloseButton onClick={onClose} className="top-4 right-4" />}
          <div className="mt-2">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- MODAL INTERNAL COMPONENTS ---

export const KineticDialog = ({
  isOpen,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
  icon: Icon,
  iconName
}: {
  isOpen: boolean,
  onClose: () => void,
  title: string,
  description: string,
  primaryAction: { label: string, onClick: () => void, colorClass?: string },
  secondaryAction?: { label: string, onClick: () => void },
  icon?: any,
  iconName?: string
}) => (
  <KineticModal isOpen={isOpen} onClose={onClose} widthClass="w-full max-w-sm" className="text-center pt-8">
    {(Icon || iconName) && (
      <div className="mx-auto w-16 h-16 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] mb-4 text-[var(--club-ink)]">
        {iconName ? (
           <DynamicIcon name={iconName} type="logo" LucideFallback={Icon} className="w-9 h-9 object-contain" />
        ) : (
           <Icon size={30} strokeWidth={2.5} />
        )}
      </div>
    )}
    <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] tracking-tight mb-2">{title}</h2>
    <p className="text-[var(--club-muted)] text-sm leading-relaxed mb-6 font-medium">{description}</p>
    <div className="flex flex-col gap-2.5">
      <button
        data-testid={`dialog-confirm-${title.toLowerCase().replace(/\W+/g,'-')}`}
        onClick={primaryAction.onClick}
        className={`pop-button ${primaryAction.colorClass?.includes('pink') ? 'pink' : primaryAction.colorClass?.includes('green') || primaryAction.colorClass?.includes('mint') ? 'mint' : 'pink'}`}
      >
        {primaryAction.label}
      </button>
      {secondaryAction && (
        <button
          data-testid={`dialog-cancel-${title.toLowerCase().replace(/\W+/g,'-')}`}
          onClick={secondaryAction.onClick}
          className="pop-button"
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  </KineticModal>
);

export const KineticIconButton = ({
  icon: Icon,
  onClick,
  colorClass = "bg-[var(--club-card)]",
  className = ""
}: {
  icon: any,
  onClick: () => void,
  colorClass?: string,
  className?: string
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`round-button ${colorClass} ${className}`}
  >
    <Icon size={20} className="text-[var(--club-ink)]" strokeWidth={2.5} />
  </motion.button>
);

export const KineticToggle = ({
  isOn,
  onToggle,
  label,
  icon: Icon
}: {
  isOn: boolean,
  onToggle: () => void,
  label: string,
  icon?: any
}) => (
  <div className="flex items-center justify-between p-3.5 border-2 border-[var(--club-line)] rounded-2xl bg-[var(--club-card)] shadow-[2px_2px_0_var(--club-line)]">
    <div className="flex items-center gap-3">
      {Icon && <div className="w-8 h-8 bg-[var(--club-butter)] rounded-xl flex items-center justify-center border-2 border-[var(--club-line)] text-[var(--club-ink)]"><Icon size={16} /></div>}
      <span className="font-bold text-[var(--club-ink)] text-sm">{label}</span>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 border-2 border-[var(--club-line)] rounded-full transition-colors ${isOn ? 'bg-[var(--club-mint)]' : 'bg-[#e2e8f0]'}`}
    >
      <motion.div
        initial={false}
        animate={{ x: isOn ? 26 : 3 }}
        className="absolute top-0.5 bottom-0.5 w-5 h-5 bg-white border-1.5 border-[var(--club-line)] rounded-full shadow-sm"
      />
    </button>
  </div>
);

export const KineticBadge = ({ text, colorClass = "bg-[var(--club-butter)]" }: { text: string, colorClass?: string }) => (
  <div className={`inline-block px-2.5 py-0.5 ${colorClass} border-1.5 border-[var(--club-line)] rounded-full text-[9px] font-bold uppercase tracking-wider text-[var(--club-ink)] shadow-[1px_1px_0_var(--club-line)]`}>
    {text}
  </div>
);

export const KineticRewardCard = ({
  reward,
  delay = 0
}: {
  reward: { type: string, amount: number, icon: any, colorClass: string },
  delay?: number
}) => {
  const Icon = reward.icon;
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 15, delay }}
      className={`relative border-2 border-[var(--club-line)] rounded-2xl ${reward.colorClass} p-4 flex flex-col items-center justify-center shadow-[3px_3px_0_var(--club-line)] overflow-hidden`}
    >
      <Icon size={40} className="text-[var(--club-ink)] relative z-10 mb-2" strokeWidth={2} />
      <div className="relative z-10 bg-white border-1.5 border-[var(--club-line)] rounded-full px-3 py-0.5 shadow-sm">
        <span className="font-bold text-[var(--club-ink)] text-xs">+{reward.amount} {reward.type}</span>
      </div>
    </motion.div>
  );
};
