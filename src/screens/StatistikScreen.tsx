import React from 'react';
import {GameShell} from '../components/GameShell';
import {ProgressNav} from '../components/ProgressNav';
import {useProfile} from '../core/profile/ProfileContext';
import {artIcon} from '../core/artAssets';
export const StatistikScreen=()=>{
  const {profile}=useProfile(),s=profile.statistics||{},number=(n:number)=>Number(n||0).toLocaleString('id-ID');
  const games=[
    {id:'onet',name:'Onet',art:'onet',rounds:s.onetGames,wins:s.onetWins,record:s.onetHighScore,detail:`Level ${profile.highestLevel||1} · ${number(s.onetMatches)} pasangan`},
    {id:'block',name:'Block Puzzle',art:'block',rounds:s.blockGames||s.blockPuzzleGames,wins:s.blockWins,record:s.blockHighScore||s.blockPuzzleHighScore,detail:`Level ${profile.highestBlockPuzzleLevel||profile.blockPuzzleLevel||1} · ${number(s.blockPuzzleStars)} bintang`},
    {id:'infinity',name:'Block Infinity',art:'block',rounds:s.infinityGames,record:s.infinityHighScore,detail:`${number(s.infinityLines)} garis dibersihkan`},
    {id:'memory',name:'Memory Flip',art:'memory',rounds:s.memoryGames,wins:s.memoryWins,record:s.memoryHighScore,detail:`${number(s.memoryMatches)} pasangan · Combo terbaik ×${number(s.memoryBestCombo)}`},
    {id:'triple',name:'Triple Match',art:'triple',rounds:s.tripleGames,wins:s.tripleWins,record:s.tripleHighScore,detail:`${number(s.tripleMatches)} trio terbentuk`}
  ];
  const minutes=Math.floor((s.totalPlayTimeMs||0)/60000),time=minutes>=60?`${Math.floor(minutes/60)}j ${minutes%60}m`:`${minutes}m`;
  return <GameShell title="Statistik permainan" eyebrow="SATU AKUN. SEMUA PERJALANANMU." wide><ProgressNav/>
    <div className="club-page-banner"><div><span className="eyebrow" data-testid="stats-caption">CATATAN KLUB</span><h2 data-testid="stats-total-rounds">{number(s.totalGames)} ronde dimainkan</h2><p data-testid="stats-total-wins">{number(s.totalWins)} kemenangan · {time} waktu bermain</p></div><img src={artIcon('stats')} alt=""/></div>
    <div className="stats-summary-grid">{[['score','Total skor',number(s.totalScore)],['record','Skor tertinggi',number(s.highestScore)],['combo','Combo terbaik',`×${number(s.highestCombo)}`],['missions','Misi diklaim',number(s.totalDailyMissionsCompleted)]].map(([id,label,value])=><div key={id}><b data-testid={`stats-${id}`}>{value}</b><span data-testid={`stats-${id}-label`}>{label}</span></div>)}</div>
    <div className="stats-game-grid">{games.map(game=><article className="stats-game-card" data-testid={`stats-game-${game.id}`} key={game.id}><header><img src={artIcon(game.art)} alt=""/><h2 data-testid={`stats-game-name-${game.id}`}>{game.name}</h2></header><dl><div><dt>Ronde</dt><dd data-testid={`stats-${game.id}-rounds`}>{number(game.rounds)}</dd></div>{game.id!=='infinity'&&<div><dt>Menang</dt><dd data-testid={`stats-${game.id}-wins`}>{number(game.wins)}</dd></div>}<div><dt>Rekor</dt><dd data-testid={`stats-${game.id}-record`}>{number(game.record)}</dd></div></dl><p data-testid={`stats-${game.id}-detail`}>{game.detail}</p></article>)}</div>
    <div className="stats-mode-note" data-testid="stats-submodes"><h2 data-testid="stats-submode-title">Cara lain menikmati game</h2><p data-testid="stats-sprint">Onet Sprint: {number(s.sprintGames)} ronde · {number(s.sprintWins)} menang</p><p data-testid="stats-multiplayer">Duel teman: {number(s.multiplayerGames)} ronde · {number(s.multiplayerWins)} menang</p><small data-testid="stats-mode-explainer">Mode ini sudah termasuk dalam rekap Onet / Block, bukan ronde tambahan.</small></div>
    <p className="fine-print" data-testid="stats-sync-note">Setiap ronde selesai dicatat satu kali. Detail pasangan, trio, dan waktu per game mulai dilacak sejak pembaruan ini; total progres lama tetap tersimpan.</p>
  </GameShell>;
};