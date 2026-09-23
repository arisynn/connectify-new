import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { Users, Swords, Trophy, AlertTriangle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KineticButton, ProfileComponent } from '../designs/KineticComponents';
import { KineticBottomSheet, KineticDialog, KineticModal, KineticBadge } from '../designs/KineticPopups';
import { useProfile } from '../core/profile/ProfileContext';
import { useMultiplayer } from '../core/hooks/useMultiplayer';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { generateBoard } from '../core/board';
import { useTheme } from '../core/theme/ThemeProvider';
import { useCDE } from '../core/cde';
import { MultiplayerGameplay } from '../game/MultiplayerGameplay';
import { MultiplayerBlockPuzzleGameplay } from '../game/block-puzzle/MultiplayerBlockPuzzleGameplay';
import { artIcon } from '../core/artAssets';

export const MultiplayerScreen = ({ onBack, isEmbedded = false }: { onBack?: () => void, isEmbedded?: boolean }) => {
  const { navigate, user } = useGame();
  const { profile } = useProfile();
  const { activeTheme } = useTheme();
  const cde=useCDE();
  const savedMatch=React.useRef<string>();
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [actionError,setActionError]=useState('');
  
  const {
    room, error, isLoading,
    createRoom, joinRoom, leaveRoom, setReady,
    startMatch, readyForGame, completeMatch, reportLoss, reportTimeUp
  } = useMultiplayer();
  useEffect(()=>{
    if(room?.status!=='FINISHED'||!room.matchId||savedMatch.current===room.matchId)return;
    savedMatch.current=room.matchId;
    cde.queueMutation('PROCESS_WIN',{game:room.gameMode==='block-puzzle'?'block':'onet',runId:room.matchId,isMultiplayer:true,isWinner:room.winner===user.name,isFlawless:false,score:0,matches:0,highestCombo:0,timeElapsed:Math.max(0,Date.now()-(room.startAt||Date.now())),level:1});
  },[room?.status,room?.matchId]);

  const handleStartMatch = () => {
      let board;
      if (room?.gameMode === 'block-puzzle') {
          board = []; // No initial board needed for block puzzle currently
      } else {
          board = generateBoard(activeTheme.id, profile.highestLevel || 1);
      }
      startMatch(board);
  };

  const handleCreate = async (gameMode: string) => {
    setActionError('');
    try {
      await createRoom(gameMode);
      setShowCreateModal(false);
    } catch (e) {
      setActionError(e instanceof Error?e.message:'Ruangan belum dapat dibuat. Coba lagi.');
    }
  };

  const handleJoin = async () => {
    setActionError('');
    if (!joinCode) return;
    try {
      await joinRoom(joinCode);
      setShowJoinModal(false);
    } catch (e) {
      setActionError(e instanceof Error?e.message:'Ruangan belum dapat ditemukan. Periksa kodenya.');
    }
  };

  const handleLeave = async () => {
    await leaveRoom();
    if (!isEmbedded) navigate('home');
  };

  const handleAttemptLeave = () => {
    if (room?.status === 'PLAYING') {
      setShowLeaveWarning(true);
    } else {
      handleLeave();
    }
  };

  useEffect(() => {
    if (room?.status === 'FINISHED') {
      setShowResultModal(true);
    } else {
      setShowResultModal(false);
    }
  }, [room?.status]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (room?.status === 'PLAYING') {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [room?.status]);

  // Derive player states
  const me = room?.players.find(p => p.name === user.name);
  const opponent = room?.players.find(p => p.name !== user.name);
  const isHost = room?.host === user.name;
  const hasPendingWager = room?.wager && !room.wager.memberAgreed;

  // Auto ready for game when starting
  useEffect(() => {
      if (room?.status === 'STARTING' && me && !me.readyForGame) {
          readyForGame();
      }
  }, [room?.status, me?.readyForGame]);

  return (
    <motion.div 
      initial={isEmbedded ? { opacity: 0, scale: 0.95 } : { opacity: 0, y: 20 }} 
      animate={isEmbedded ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }} 
      exit={isEmbedded ? { opacity: 0, scale: 0.95 } : { opacity: 0, y: 20 }} 
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={isEmbedded ? "flex-1 w-full flex flex-col font-sans relative pb-28 pt-24 text-[var(--club-ink)]" : "absolute inset-0 bg-[var(--club-paper)] z-[100] flex flex-col font-sans text-[var(--club-ink)]"}
    >
      {/* Standalone Header (Only if not embedded) */}
      {!isEmbedded && (
        <div className="shell-header">
          <button
              data-testid="multiplayer-back"
              onClick={room ? handleAttemptLeave : (onBack || (() => navigate('home')))}
              className="round-button"
              aria-label="Kembali"
          >
            <DynamicIcon name="back" type="logo" className="w-5 h-5 object-contain text-[var(--club-ink)]" />
          </button>
          <div>
            <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">DUEL DARING</span>
            <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">
              {room ? `Room #${room.id}` : 'Multiplayer'}
            </h2>
          </div>
        </div>
      )}

      {!room ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto w-full">
           <div className="w-20 h-20 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl shadow-[4px_4px_0_var(--club-line)] flex items-center justify-center mb-5">
              <img src={artIcon('multiplayer')} alt="" className="w-16 h-16 object-contain"/>
           </div>
           
           <h3 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] mb-1.5">Bermain Bersama</h3>
           <p className="font-medium text-xs text-[var(--club-muted)] mb-8 max-w-xs">Tantang teman secara real-time dan buktikan siapa yang tercepat menghubungkan pasangan tile!</p>
           
           <div className="w-full flex flex-col gap-3">
              <button 
                data-testid="multiplayer-create"
                onClick={() => setShowCreateModal(true)} 
                className="pop-button butter w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2" 
                disabled={isLoading}
              >
                 <Users size={18} />
                 <span>Buat Ruangan Baru</span>
              </button>
              <button 
                data-testid="multiplayer-join"
                onClick={() => setShowJoinModal(true)} 
                className="pop-button mint w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2" 
                disabled={isLoading}
              >
                 <Swords size={18} />
                 <span>Gabung Ruangan</span>
              </button>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-5 overflow-y-auto max-w-lg mx-auto w-full">
           {room.status === 'PLAYING' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <Swords size={56} className="text-[#e11d48] mb-4 animate-bounce" />
                 <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] mb-1">Game Sedang Berlangsung!</h2>
                 <p className="font-medium text-xs text-[var(--club-muted)]">Hubungkan ubin secepat mungkin!</p>
              </div>
           ) : (
             <>
               <div className="flex items-center justify-between mb-5 bg-[var(--club-card)] border-2 border-[var(--club-line)] p-4 rounded-2xl shadow-[3px_3px_0_var(--club-line)]">
                  <div>
                    <span className="font-bold text-[9px] text-[var(--club-muted)] uppercase tracking-wider block mb-0.5">KODE RUANGAN</span>
                    <h1 className="font-['Fredoka'] font-semibold text-3xl text-[var(--club-ink)] tracking-wider leading-none">{room.id}</h1>
                  </div>
                  <button onClick={handleAttemptLeave} className="round-button pink" title="Keluar Ruangan">
                     <LogOut size={18} className="text-[var(--club-ink)]" />
                  </button>
               </div>

               <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-bold text-xs text-[var(--club-muted)] uppercase tracking-wider">
                     Mode: {room.mode || 'Klasik'}
                  </span>
                  <span className="font-bold text-xs bg-[var(--club-card)] border border-[var(--club-line)] rounded-full px-2.5 py-0.5 shadow-xs">
                    {room.players.length}/2 Pemain
                  </span>
               </div>

               <div className="flex flex-col gap-3 mb-6">
                  <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3.5 flex items-center gap-3 shadow-[2px_2px_0_var(--club-line)]">
                    <div className="w-11 h-11 shrink-0">
                      <ProfileComponent avatarStr={profile?.activeAvatarId} avatarBg={profile?.activeAvatarBackground} className="!w-full !h-full" />
                    </div>
                    <span className="font-bold text-sm text-[var(--club-ink)] flex-1">{me?.name} (Kamu)</span>
                    <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full border ${me?.ready ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>{me?.ready ? 'Ready' : 'Menunggu'}</span>
                  </div>
                  
                  {opponent ? (
                     <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3.5 flex items-center gap-3 shadow-[2px_2px_0_var(--club-line)]">
                       <div className="w-11 h-11 shrink-0">
                         <ProfileComponent avatarStr="avatar_male" avatarBg="#bde0fe" className="!w-full !h-full" />
                       </div>
                       <span className="font-bold text-sm text-[var(--club-ink)] flex-1">{opponent.name}</span>
                       <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full border ${opponent.ready ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>{opponent.ready ? 'Ready' : 'Menunggu'}</span>
                     </div>
                  ) : (
                     <div className="bg-[var(--club-card)]/50 border-2 border-dashed border-[var(--club-line)]/40 rounded-2xl p-4 flex justify-center items-center h-20">
                       <span className="font-bold text-xs text-[var(--club-muted)] uppercase tracking-wider">Menunggu Pemain Lain Bergabung...</span>
                     </div>
                  )}
               </div>

               <div className="flex flex-col gap-3 mt-auto">
                 {room.status === 'STARTING' ? (
                     <div className="text-center p-4">
                        <h3 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] animate-pulse">Game Segera Dimulai...</h3>
                     </div>
                 ) : (
                     <>
                        <button 
                          onClick={() => setReady(!me?.ready)} 
                          className={`pop-button w-full py-3.5 text-sm font-bold ${me?.ready ? 'pink' : 'mint'}`} 
                          disabled={isLoading || (hasPendingWager && !isHost)}
                        >
                           {me?.ready ? 'Batal Siap' : 'Siap Bertanding!'}
                        </button>
                        {isHost && room.players.length === 2 && room.players.every(p => p.ready) && (
                           <button 
                             onClick={handleStartMatch} 
                             className="pop-button butter w-full py-3.5 text-sm font-bold" 
                             disabled={hasPendingWager}
                           >
                              Mulai Game Sekarang
                           </button>
                        )}
                     </>
                 )}
               </div>
             </>
           )}
        </div>
      )}
      
      <AnimatePresence>
        {(room?.status === 'PLAYING' || room?.status === 'FINISHED') && room?.gameMode === 'onet' && (
           <motion.div 
             key="onet-gameplay" 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 20, opacity: 0 }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="absolute inset-0 z-50 bg-[var(--club-paper)]"
           >
           <MultiplayerGameplay room={room} user={user} profile={profile} completeMatch={completeMatch} reportTimeUp={reportTimeUp} onAttemptLeave={handleAttemptLeave} />
           </motion.div>
        )}
        {(room?.status === 'PLAYING' || room?.status === 'FINISHED') && room?.gameMode === 'block-puzzle' && (
           <motion.div 
             key="block-puzzle-gameplay" 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: 20, opacity: 0 }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="absolute inset-0 z-50 bg-[var(--club-paper)]"
           >
             <MultiplayerBlockPuzzleGameplay room={room} user={user} profile={profile} reportLoss={reportLoss} reportTimeUp={reportTimeUp} onAttemptLeave={handleAttemptLeave} />
           </motion.div>
        )}
      </AnimatePresence>

      <KineticModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Gabung ruangan" widthClass="w-full max-w-sm" className="text-center">
        <div className="flex flex-col items-center">
           <div className="w-14 h-14 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] mb-3">
               <Users size={28} className="text-[var(--club-ink)]" />
           </div>
           <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] mb-1">Gabung Ruangan</h2>
           <p className="font-medium text-xs text-[var(--club-muted)] mb-5">Masukkan kode ruangan yang diberikan temanmu.</p>
           
           <div className="bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl p-3 shadow-inner mb-5 w-full">
              <input data-testid="multiplayer-room-code" aria-label="Kode ruangan" maxLength={12} type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="KODE RUANGAN" className="w-full font-['Fredoka'] font-semibold text-2xl text-center text-[var(--club-ink)] uppercase outline-none placeholder:text-[var(--club-muted)]/50 bg-transparent" />
           </div>
           
           <div className="flex flex-col gap-2.5 w-full">
               <button data-testid="multiplayer-join-confirm" onClick={handleJoin} className="pop-button mint w-full py-2.5 font-bold text-xs" disabled={isLoading || !joinCode.trim()}>Gabung</button>
               {(actionError||error)&&<p role="alert" data-testid="multiplayer-join-error" className="text-sm text-red-600">{actionError||error}</p>}
           </div>
        </div>
      </KineticModal>

      <KineticModal 
        isOpen={showCreateModal} 
        title="Buat ruangan"
        onClose={() => setShowCreateModal(false)}
        widthClass="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] mb-3">
                <Users size={28} className="text-[var(--club-ink)]" />
            </div>
            <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] mb-1">Buat Ruangan</h2>
            <p className="font-medium text-xs text-[var(--club-muted)] mb-5">Pilih mode permainan yang ingin kamu mainkan.</p>
            
            <div className="flex flex-col gap-2.5 w-full">
                <button 
                    data-testid="multiplayer-create-onet"
                    onClick={() => handleCreate('onet')} 
                    className="pop-button butter w-full py-3 text-xs font-bold" 
                    disabled={isLoading}
                >
                    Main Connect Onet
                </button>
                <button 
                    data-testid="multiplayer-create-block"
                    onClick={() => handleCreate('block-puzzle')} 
                    className="pop-button pink w-full py-3 text-xs font-bold" 
                    disabled={isLoading}
                >
                    Main Block Puzzle
                </button>
                {(actionError||error)&&<p role="alert" data-testid="multiplayer-create-error" className="text-sm text-red-600">{actionError||error}</p>}
            </div>
        </div>
      </KineticModal>

      <KineticDialog
        isOpen={showLeaveWarning}
        onClose={() => setShowLeaveWarning(false)}
        icon={AlertTriangle}
        title="Keluar Permainan?"
        description="Kamu sedang dalam permainan aktif. Keluar sekarang akan dihitung sebagai kekalahan. Yakin ingin keluar?"
        primaryAction={{ label: 'Ya, Keluar', onClick: () => { setShowLeaveWarning(false); handleLeave(); } }}
        secondaryAction={{ label: 'Batal', onClick: () => setShowLeaveWarning(false) }}
      />

      <KineticModal isOpen={showResultModal} title="Hasil pertandingan" widthClass="w-full max-w-sm" className="text-center pt-8">
        <div className="w-16 h-16 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] mx-auto mb-4">
           <img src={artIcon('achievements')} alt="" className="w-14 h-14 object-contain"/>
        </div>
        
        {room?.winner === 'DRAW' ? (
            <>
               <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] mb-1">Pertandingan Seri!</h2>
               <p className="font-medium text-xs text-[var(--club-muted)] mb-6">Waktu pertandingan habis</p>
            </>
        ) : room?.winner === user.name ? (
            <>
               <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] mb-1">Kamu Menang!</h2>
               <p data-testid="multiplayer-win-caption" className="font-medium text-xs text-[#16a34a] font-bold mb-6">Juara ronde ini. Kerja bagus!</p>
               {room?.finishReason === 'DISCONNECT' && (
                  <p className="text-[11px] font-bold text-[#e11d48] -mt-4 mb-4 px-3 py-1 bg-red-50 border border-red-200 rounded-full inline-block">Lawan Keluar dari Pertandingan</p>
               )}
            </>
        ) : (
            <>
               <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] mb-1">Kamu Kalah!</h2>
               <p className="font-medium text-xs text-[var(--club-muted)] mb-6">Tetap semangat, coba tanding lagi!</p>
            </>
        )}
        
        <button data-testid="multiplayer-result-menu" onClick={() => { setShowResultModal(false); handleLeave(); }} className="pop-button mint w-full py-2.5 font-bold text-xs">Pilih permainan</button>
      </KineticModal>
    </motion.div>
  );
};
