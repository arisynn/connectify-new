import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cloud, Clock, Copy, Trash2, Database, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { KineticButton } from '../designs/KineticComponents';
import { useCDE } from '../core/cde';
import { CDE } from '../core/cde/CDE';
import { CDEAuth } from '../core/cde/auth/CDEAuth';

interface Props {
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  profileId: string;
}

export const AccountDataPopup: React.FC<Props> = ({ isOpen, onClose, onLogout, profileId, onReset }) => {
  const cde = useCDE();
  const [logs] = useState<any[]>([]); // Placeholder if we don't have actual logs, per instructions we should not fake them. Wait, CDE doesn't provide categories so I'll just show an empty log list or note. Or just show the pending operations as the "log".
  // Actually, I can fetch the outbox as the diagnostic log since it's all we have natively in CDE.
  const [outbox, setOutbox] = useState<any[]>([]);
  
  React.useEffect(() => {
     if (isOpen) {
        CDE.getPendingOperations().then(setOutbox);
     }
  }, [isOpen, cde.syncStatus]);

  const handleSync = async () => {
     await CDE.forceSync();
     CDE.getPendingOperations().then(setOutbox);
  };
  
  const formatDate = (ts: number | null) => {
     if (!ts) return "Belum pernah";
     return new Date(ts).toLocaleString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-[200] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full z-[201] flex flex-col pointer-events-none"
          >
            <div className="flex-1 bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-[24px] shadow-[6px_6px_0_var(--club-line)] overflow-hidden flex flex-col pointer-events-auto text-[var(--club-ink)] max-h-[85vh]">
              
              {/* Header */}
              <div className="bg-[var(--club-card)] border-b-2 border-[var(--club-line)] px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">DIAGNOSTIK</span>
                  <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Status Sistem</h2>
                </div>
                <button
                  onClick={onClose}
                  className="round-button"
                  aria-label="Tutup status sistem"
                >
                  <span className="text-base font-bold">✕</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                
                {/* Account Info */}
                <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[2px_2px_0_var(--club-line)]">
                  <h3 className="font-bold text-[var(--club-muted)] text-xs uppercase tracking-wider mb-2">Informasi Akun</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center text-[var(--club-ink)]">
                      <Smartphone size={22} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-[var(--club-muted)] text-xs">ID Pemain</span>
                      <span className="font-bold text-[var(--club-ink)] truncate text-sm">PLAYER-{profileId}</span>
                    </div>
                  </div>
                </div>

                {/* Cloud Status */}
                <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[2px_2px_0_var(--club-line)] flex flex-col gap-2">
                  <h3 className="font-bold text-[var(--club-muted)] text-xs uppercase tracking-wider mb-1">CDE / Sinkronisasi</h3>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-[var(--club-muted)] text-xs">Koneksi Internet</span>
                    <span className={`font-bold text-xs ${navigator.onLine ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                      {navigator.onLine ? 'Tersambung' : 'Terputus'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-[var(--club-muted)] text-xs">Status Sesi</span>
                    <span className={`font-bold text-xs ${cde.account ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                      {cde.account ? 'Aktif' : 'Tamu (Lokal)'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-[var(--club-muted)] text-xs">Revisi Lokal</span>
                    <span className="font-bold text-blue-600 text-xs">{cde.profile?.revision || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-[var(--club-muted)] text-xs">Antrean Pending</span>
                    <span className="font-bold text-orange-600 text-xs">{cde.pendingOpsCount} operasi</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-medium text-[var(--club-muted)] text-xs">Status Sinkron</span>
                    <span className="font-bold text-[var(--club-ink)] text-xs">{cde.syncStatus}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1.5">
                    <span className="font-medium text-[var(--club-muted)] text-xs">Terakhir Sinkron</span>
                    <span className="font-bold text-[var(--club-ink)] text-[11px]">{formatDate(cde.lastSync)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <button
                    onClick={handleSync}
                    className="pop-button mint"
                  >
                    <Cloud size={17} />
                    <span>Sinkronkan Sekarang</span>
                  </button>
                </div>

                {/* Diagnostic Log */}
                <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[2px_2px_0_var(--club-line)] flex flex-col gap-2">
                  <h3 className="font-bold text-[var(--club-muted)] text-xs uppercase tracking-wider">Log Antrean Operasi</h3>
                  <div className="bg-[#172337] rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] text-[#46b995] flex flex-col gap-1">
                    {outbox.length === 0 ? (
                      <span className="text-gray-400 text-center my-auto">Antrean bersih (Semua operasi tersimpan)</span>
                    ) : (
                      outbox.map((op, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-gray-400">[{new Date(op.createdAt).toLocaleTimeString()}]</span>
                          <span className={op.status === 'ERROR' || op.status === 'FAILED' ? 'text-red-400' : 'text-blue-300'}>
                            {op.type}
                          </span>
                          <span className="text-yellow-300">({op.status})</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
