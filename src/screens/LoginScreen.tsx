import { DynamicIcon } from "../components/theme/DynamicIcon";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../GameContext';
import { CDEAuth } from '../core/cde/auth/CDEAuth';

export const LoginScreen = () => {
  const { navigate } = useGame();
  React.useEffect(() => {
    const loader = document.getElementById('static-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }
  }, []);
  
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [stage, setStage] = useState<'nickname' | 'password'>('nickname');
  const [isNewAccount, setIsNewAccount] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanName = nickname.trim();
    if (!cleanName) {
      setError('Nickname tidak boleh kosong!');
      return;
    }
    if (cleanName.length < 3) {
      setError('Nickname minimal 3 karakter!');
      return;
    }

    if (stage === 'nickname') {
        setError('');
        setIsLoading(true);
        try {
            const exists = await CDEAuth.checkUsernameExists(cleanName);
            setIsNewAccount(!exists);
            setStage('password');
        } catch (err) {
            console.error('Check username failed:', err);
            setError('Gagal memeriksa nama pemain.');
        } finally {
            setIsLoading(false);
        }
        return;
    }
    
    if (!password) {
      setError('Kata sandi tidak boleh kosong!');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter!');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await CDEAuth.login(cleanName, password, isNewAccount);
      navigate('startup');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Gagal masuk. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 z-50 bg-[var(--club-paper)] flex flex-col items-center justify-center p-6 text-[var(--club-ink)]"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', damping: 25, stiffness: 300 }} 
        className="w-full max-w-sm bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[26px] shadow-[6px_6px_0_var(--club-line)] p-7 relative overflow-hidden"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-18 h-18 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl p-2 shadow-[3px_3px_0_var(--club-line)] mb-3 flex items-center justify-center">
             <DynamicIcon name="connectify_logo" type="logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block mb-0.5">CONNECTIFY CLUB</span>
          <h1 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight">
            {stage === 'nickname' 
              ? 'Selamat Datang!' 
              : isNewAccount 
                ? 'Pemain Baru' 
                : 'Masuk Kembali'}
          </h1>
          <p className="font-medium text-xs text-[var(--club-muted)] mt-1 max-w-[240px]">
             {stage === 'nickname' 
                 ? 'Masukkan nama pemain untuk mulai bertualang.' 
                 : isNewAccount 
                    ? 'Buat kata sandi untuk mengamankan data dan progresmu.' 
                    : 'Ketikkan kata sandimu untuk melanjutkan permainan.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <AnimatePresence mode="wait">
              {stage === 'nickname' ? (
                  <motion.div key="nickname-stage" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex flex-col gap-1.5">
                    <label className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)] pl-0.5">Nama Pemain</label>
                    <input 
                      data-testid="login-nickname"
                      aria-label="Nickname"
                      autoComplete="username"
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ketik namamu..."
                      disabled={isLoading}
                      className="w-full bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl px-3.5 py-2.5 font-bold text-sm text-[var(--club-ink)] placeholder:text-[var(--club-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--club-butter)] transition-all shadow-inner"
                    />
                  </motion.div>
              ) : (
                  <motion.div key="password-stage" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-0.5">
                        <label className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)]">Kata Sandi</label>
                        <button 
                            data-testid="login-change-name"
                            type="button" 
                            onClick={() => { setStage('nickname'); setPassword(''); setError(''); }}
                            className="font-bold text-xs text-[#e11d48] hover:underline uppercase"
                        >
                            Ganti Nama
                        </button>
                    </div>
                    <input 
                      data-testid="login-password"
                      aria-label="Kata sandi"
                      autoComplete={isNewAccount?'new-password':'current-password'}
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      disabled={isLoading}
                      className="w-full bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl px-3.5 py-2.5 font-bold text-sm text-[var(--club-ink)] placeholder:text-[var(--club-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--club-butter)] transition-all shadow-inner"
                    />
                  </motion.div>
              )}
          </AnimatePresence>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-300 rounded-xl px-3 py-2 text-center"
              >
                <span data-testid="login-error" role="alert" className="font-bold text-[#e11d48] text-xs block">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col gap-2 mt-1">
              <button 
                data-testid="login-submit"
                type="submit"
                disabled={isLoading}
                className="pop-button mint w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-[var(--club-line)] border-t-transparent rounded-full"
                  />
                ) : (
                  stage === 'nickname' ? 'Lanjut' : isNewAccount ? 'Buat Akun & Main' : 'Masuk ke Game'
                )}
              </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
