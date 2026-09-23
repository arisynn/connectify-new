import { DynamicIcon } from "../components/theme/DynamicIcon";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, KeyRound, Loader2 } from 'lucide-react';
import { useGame } from '../GameContext';
import { CDEAuth } from '../core/cde/auth/CDEAuth';

type Lookup = 'idle' | 'checking' | 'new' | 'existing' | 'unknown';

// Smart login: one form. A known name signs in, an unknown name is registered on the spot.
export const LoginScreen = () => {
  const { navigate } = useGame();
  useEffect(() => {
    const loader = document.getElementById('static-loader');
    if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 300); }
  }, []);

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookup, setLookup] = useState<Lookup>('idle');
  const cleanName = nickname.trim();

  useEffect(() => {
    if (cleanName.length < 3) { setLookup('idle'); return; }
    setLookup('checking');
    let cancelled = false;
    const timer = setTimeout(async () => {
      try { const exists = await CDEAuth.checkUsernameExists(cleanName); if (!cancelled) setLookup(exists ? 'existing' : 'new'); }
      catch { if (!cancelled) setLookup('unknown'); }
    }, 450);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [cleanName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanName) return setError('Nama pemain tidak boleh kosong!');
    if (cleanName.length < 3) return setError('Nama pemain minimal 3 karakter!');
    if (!password) return setError('Kata sandi tidak boleh kosong!');
    if (password.length < 6) return setError('Kata sandi minimal 6 karakter!');
    setError(''); setIsLoading(true);
    try {
      await CDEAuth.smartLogin(cleanName, password);
      navigate('startup');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Gagal masuk. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const hint = lookup === 'checking' ? 'Memeriksa nama…' : lookup === 'new' ? 'Nama tersedia. Akun baru akan dibuat dengan kata sandi ini.' : lookup === 'existing' ? 'Nama sudah terdaftar. Masuk dengan kata sandimu.' : lookup === 'unknown' ? 'Nama akan diperiksa saat kamu menekan Lanjut.' : 'Nama baru otomatis jadi akun baru. Nama lama langsung masuk.';
  const inputClass = "w-full bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl px-3.5 py-2.5 font-bold text-sm text-[var(--club-ink)] placeholder:text-[var(--club-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--club-butter)] transition-all shadow-inner";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-[var(--club-paper)] flex flex-col items-center justify-center p-6 text-[var(--club-ink)]">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="w-full max-w-sm bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[26px] shadow-[6px_6px_0_var(--club-line)] p-7 relative overflow-hidden">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-18 h-18 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl p-2 shadow-[3px_3px_0_var(--club-line)] mb-3 flex items-center justify-center">
            <DynamicIcon name="connectify_logo" type="logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block mb-0.5">CONNECTIFY CLUB</span>
          <h1 data-testid="login-title" className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight">{lookup === 'new' ? 'Pemain Baru' : lookup === 'existing' ? 'Masuk Kembali' : 'Selamat Datang!'}</h1>
          <p className="font-medium text-xs text-[var(--club-muted)] mt-1 max-w-[260px]">Satu langkah saja. Nama pemain dan kata sandi, sisanya kami urus.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)] pl-0.5">Nama Pemain</label>
            <input data-testid="login-nickname" aria-label="Nickname" autoComplete="username" type="text" value={nickname} onChange={(e) => { setNickname(e.target.value); setError(''); }} placeholder="Ketik namamu..." disabled={isLoading} className={inputClass} />
            <p data-testid="login-lookup-hint" data-state={lookup} className={`flex items-center gap-1.5 text-[11px] font-bold pl-0.5 min-h-[16px] ${lookup === 'new' ? 'text-emerald-700' : lookup === 'existing' ? 'text-sky-700' : 'text-[var(--club-muted)]'}`}>
              {lookup === 'checking' ? <Loader2 size={12} className="animate-spin" /> : lookup === 'new' ? <Sparkles size={12} /> : lookup === 'existing' ? <KeyRound size={12} /> : null}{hint}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)] pl-0.5">Kata Sandi</label>
            <input data-testid="login-password" aria-label="Kata sandi" autoComplete={lookup === 'new' ? 'new-password' : 'current-password'} type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Minimal 6 karakter" disabled={isLoading} className={inputClass} />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-center">
                <span data-testid="login-error" role="alert" className="font-bold text-[#e11d48] text-xs block">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button data-testid="login-submit" type="submit" disabled={isLoading} className="pop-button mint w-full py-3 text-xs font-bold flex items-center justify-center gap-2 mt-1">
            {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-[var(--club-line)] border-t-transparent rounded-full" /> : lookup === 'new' ? 'Buat Akun & Main' : lookup === 'existing' ? 'Masuk ke Game' : 'Lanjut'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
