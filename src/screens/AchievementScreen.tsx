import React from 'react';
import {GameShell} from '../components/GameShell';
import {ProgressNav} from '../components/ProgressNav';
import {AchievementPanel} from '../components/AchievementPanel';
import {EconomyMeter} from '../components/EconomyMeter';
export const AchievementScreen=()=>
  <GameShell title="Pencapaian klub" eyebrow="JEJAK LINTAS GAME" wide><div data-testid="achievement-screen">
    <ProgressNav/>
    <EconomyMeter compact id="achievement-income"/>
    <AchievementPanel game="hub"/>
    <p className="fine-print" data-testid="achievement-game-note">Pencapaian khusus tiap game ada di menu Pencapaian masing-masing game.</p>
  </div></GameShell>;
