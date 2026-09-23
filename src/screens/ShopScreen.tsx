import React from 'react';
import {GameShell} from '../components/GameShell';
import {ShopPanel} from '../components/ShopPanel';
export const ShopScreen=()=><GameShell title="Toko Hub" eyebrow="CONNECTIFY CLUB" wide><ShopPanel game="hub"/><p className="fine-print" data-testid="shop-game-note">Skin, tema, item, dan upgrade tiap game dijual di toko dalam game masing-masing.</p></GameShell>;
