import React, { useState } from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, Candy, Heart, RefreshCw, Search, Hammer, Bomb, Check, AlertTriangle, Package, Palette, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KineticButton, CurrencyPill } from '../designs/KineticComponents';
import { KineticDialog, KineticModal } from '../designs/KineticPopups';
import { useProfile } from '../core/profile/ProfileContext';
import { ITEM_PRICES, getItemPrice } from '../core/economy';
const ShopConfig = [
    { id: 'shuffle', title: 'Shuffle Board', description: 'Acak papan permainan Connect, atau ganti pilihan balok di Block Puzzle.', price: ITEM_PRICES.shuffle, colorClass: 'bg-orange-200', iconColorClass: 'text-orange-600', iconName: 'RefreshCw', owned: 'shuffles' },
    { id: 'hint', title: 'Hint Tile', description: 'Tunjukkan satu pasang tile yang bisa dihubungkan.', price: ITEM_PRICES.hint, colorClass: 'bg-blue-200', iconColorClass: 'text-blue-600', iconName: 'Search', owned: 'hints' },
    { id: 'hammer', title: 'Hammer (Hancur)', description: 'Hancurkan satu blok yang mengganggu di papan Block Puzzle.', price: ITEM_PRICES.hammer, colorClass: 'bg-amber-200', iconColorClass: 'text-amber-600', iconName: 'Hammer', owned: 'hammers' },
    { id: 'bomb', title: 'Bomb (Ledakan)', description: 'Hancurkan area 3x3 blok di papan Block Puzzle.', price: ITEM_PRICES.bomb, colorClass: 'bg-red-200', iconColorClass: 'text-red-600', iconName: 'Bomb', owned: 'bombs' }
];
import { useTheme } from '../core/theme/ThemeProvider';
import { useCDE } from '../core/cde';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { EconomyMeter } from '../components/EconomyMeter';

const IconMap: Record<string, any> = {
    RefreshCw: RefreshCw,
    Search: Search,
    Hammer: Hammer,
    Bomb: Bomb
};

const ThemeCard = ({ 
  tileImages,
  themeId,
  title, 
  state, 
  price,
  color1, 
  color2,
  onEquip,
  onBuy
}: { 
  tileImages: string[],
  themeId: string,
  title: string, 
  state: 'equipped' | 'unlocked' | 'locked', 
  price: number,
  color1: string, 
  color2: string,
  onEquip?: () => void,
  onBuy?: () => void
}) => (
  <div data-testid={`shop-theme-${themeId}`} className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3.5 shadow-[3px_3px_0_var(--club-line)] flex flex-col justify-between text-[var(--club-ink)]">
     <div>
       <div className="w-full h-22 border-2 border-[var(--club-line)] rounded-xl mb-3 flex items-center justify-center relative overflow-hidden shadow-[1px_1px_0_var(--club-line)]" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}>
          <div className="flex gap-1.5 p-1.5">{tileImages.slice(0,3).map((src,i)=><img key={i} src={src} alt={`Contoh ${title} ${i+1}`} className="w-10 h-10 object-contain bg-white rounded-lg border-2 border-[var(--club-line)] shadow-xs"/>)}</div>
          {state === 'equipped' && (
             <div className="absolute top-2 right-2 bg-white border-2 border-[var(--club-line)] rounded-full p-1 shadow-sm">
                <Check size={14} className="text-[#16a34a]" strokeWidth={3} />
             </div>
          )}
       </div>
       <h3 className="font-['Fredoka'] font-semibold text-base text-[var(--club-ink)] text-center mb-3">{title}</h3>
     </div>
     
     {state === 'equipped' && (
       <button disabled className="pop-button w-full py-2 text-xs !shadow-none opacity-50 cursor-default">Sedang Dipakai</button>
     )}
     {state === 'unlocked' && (
       <button onClick={onEquip} className="pop-button pink w-full py-2 text-xs font-bold">Pakai Tema</button>
     )}
     {state === 'locked' && (
       <button onClick={onBuy} className="pop-button butter w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5">
          <span>{price}</span> <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-3.5 h-3.5 object-contain" />
       </button>
     )}
  </div>
);

const ShopItem = ({ 
  icon: Icon, 
  iconName,
  title, 
  description, 
  price, 
  colorClass = "bg-[var(--club-paper)]", 
  iconColorClass = "text-[var(--club-ink)]",
  ownedCount,
  onBuy
}: { 
  icon: any, 
  iconName?: string,
  title: string, 
  description: string, 
  price: number, 
  colorClass?: string, 
  iconColorClass?: string,
  ownedCount?: number,
  onBuy: () => void 
}) => (
  <div data-testid={`shop-item-${iconName}`} className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex items-center gap-3.5 text-[var(--club-ink)]">
     <div className={`w-14 h-14 ${colorClass} border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shrink-0 shadow-[2px_2px_0_var(--club-line)] relative`}>
        {ownedCount !== undefined && (
          <span data-testid={`shop-owned-${iconName}`} className="absolute -top-1.5 -right-1.5 min-w-[1.4rem] h-5 px-1 bg-[var(--club-butter)] rounded-full border border-[var(--club-line)] flex items-center justify-center text-[10px] font-bold text-[var(--club-ink)] shadow-xs">x{ownedCount}</span>
        )}
        {iconName ? (
           <DynamicIcon name={iconName} type="logo" LucideFallback={Icon} className={`w-8 h-8 object-contain ${iconColorClass}`} />
        ) : (
           <Icon size={26} className={iconColorClass} />
        )}
     </div>
     <div className="flex-1 min-w-0">
        <h3 className="font-['Fredoka'] font-semibold text-base text-[var(--club-ink)] leading-tight mb-0.5">{title}</h3>
        <p className="font-medium text-xs text-[var(--club-muted)] leading-tight mb-2.5 line-clamp-2">{description}</p>
        <button onClick={onBuy} className="pop-button butter py-1.5 px-3 flex items-center gap-1.5 text-xs font-bold">
           <span>{price}</span> <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-3.5 h-3.5 object-contain" />
        </button>
     </div>
  </div>
);

export const ShopScreen = () => {
  const { navigate } = useGame();
  const { profile, updateProfile } = useProfile();
  const cde = useCDE();
  const { activeTheme, setTheme, availableThemes } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'item' | 'tema'>('item');
  const [purchaseModal, setPurchaseModal] = useState<{name: string, price: number, id: string, type?: 'item' | 'theme'} | null>(null);
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
        if (purchaseModal.type === 'theme') {
            cde.queueMutation('PURCHASE_ITEM', { itemId: 'theme_' + purchaseModal.id });
        } else {
            cde.queueMutation('PURCHASE_ITEM', { itemId: purchaseModal.id });
        }
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
            <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">PASAR</span>
            <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Toko Item</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-full shadow-[2px_2px_0_var(--club-line)]">
          <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-4 h-4 object-contain" />
          <span className="font-bold text-xs text-[var(--club-ink)]">{cde.permen}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4 shrink-0 max-w-xl mx-auto w-full">
        <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-1 flex gap-1 shadow-[2px_2px_0_var(--club-line)]">
          <button
            onClick={() => setActiveTab('item')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeTab === 'item' ? 'bg-[var(--club-butter)] border-1.5 border-[var(--club-line)] text-[var(--club-ink)] shadow-[1px_1px_0_var(--club-line)]' : 'border border-transparent text-[var(--club-muted)] hover:text-[var(--club-ink)]'}`}
          >
            <Package size={15} strokeWidth={2.5} /> Item Bantuan
          </button>
          <button
            onClick={() => setActiveTab('tema')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeTab === 'tema' ? 'bg-[var(--club-butter)] border-1.5 border-[var(--club-line)] text-[var(--club-ink)] shadow-[1px_1px_0_var(--club-line)]' : 'border border-transparent text-[var(--club-muted)] hover:text-[var(--club-ink)]'}`}
          >
            <Palette size={15} strokeWidth={2.5} /> Tema Papan
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5 max-w-xl mx-auto w-full pb-16">
         <EconomyMeter compact id="shop-income"/>
         {activeTab === 'item' && (
           <>
             {ShopConfig.map((item) => {
                 const IconComponent = IconMap[item.iconName] || Search;
                 return (
                   <ShopItem 
                     key={item.id}
                     icon={IconComponent} 
                     iconName={item.id}
                     title={item.title} 
                     description={item.description} 
                     price={item.price} 
                     colorClass={item.colorClass} 
                     iconColorClass={item.iconColorClass}
                     ownedCount={profile?.[item.owned] ?? 0}
                     onBuy={() => setPurchaseModal({name: item.title, price: item.price, id: item.id, type: 'item'})} 
                   />
                 );
             })}
             <div className="text-center text-xs text-[var(--club-muted)] mt-2">Semua item dibeli menggunakan Permen</div>
           </>
         )}

         {activeTab === 'tema' && (
           <div className="grid grid-cols-2 gap-3.5 content-start">
             {Object.values(availableThemes).map((theme) => {
               const isEquipped = activeTheme.id === theme.id;
               const isUnlocked = profile?.unlockedThemes?.includes(theme.id);
               const state = isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked');

               return (
                 <ThemeCard 
                   key={theme.id}
                   tileImages={Object.values(theme.assets.tiles)}
                   themeId={theme.id}
                   title={theme.name} 
                   state={state} 
                   price={getItemPrice('theme_' + theme.id) || theme.price}
                   color1={theme.colors.bg || theme.colors['bg-main']} 
                   color2={theme.colors.primary || theme.colors['primary-coral-pink']} 
                   onEquip={() => { setTheme(theme.id); updateProfile({ activeTheme: theme.id }); }}
                   onBuy={() => setPurchaseModal({ id: theme.id, name: theme.name, price: getItemPrice('theme_' + theme.id) || theme.price, type: 'theme' })}
                 />
               );
             })}
           </div>
         )}
      </div>

      <KineticDialog
        isOpen={purchaseModal !== null}
        onClose={() => setPurchaseModal(null)}
        icon={Candy}
        iconName="permen"
        title="Beli Item?"
        description={`Apakah kamu yakin menukar ${purchaseModal?.price} Permen untuk ${purchaseModal?.name}?`}
        primaryAction={{ label: 'Ya, Beli', onClick: handleBuy, colorClass: 'bg-[#46b995]' }}
        secondaryAction={{ label: 'Batal', onClick: () => setPurchaseModal(null) }}
      />

      <KineticModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} widthClass="w-full max-w-xs" className="text-center pt-8">
        <div className="w-14 h-14 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl mx-auto flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] mb-4">
           <Check size={28} className="text-[var(--club-ink)]" strokeWidth={3}/>
        </div>
        <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] mb-6">Pembelian Berhasil!</h2>
        <button onClick={() => setShowSuccess(false)} className="pop-button mint w-full py-2.5 font-bold text-sm">OK</button>
      </KineticModal>

      <KineticDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        icon={AlertTriangle}
        title="Permen Kurang"
        description="Maaf, kamu tidak memiliki cukup Permen untuk membeli item ini."
        primaryAction={{ label: 'Tutup', onClick: () => setShowError(false) }}
      />

      {/* TOAST MODAL */}
      <AnimatePresence>
         {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-20 left-0 right-0 flex justify-center z-[120] pointer-events-none px-4"
            >
              <div className="bg-[var(--club-card)] text-[var(--club-ink)] font-bold text-xs px-5 py-2.5 rounded-full shadow-[4px_4px_0_var(--club-line)] border-2 border-[var(--club-line)]">
                {toastMsg}
              </div>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};
