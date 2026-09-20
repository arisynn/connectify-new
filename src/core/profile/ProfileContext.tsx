import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getDefaultProfile } from './defaultProfile';
import { CDE } from '../cde/CDE';
import { unlockArtRewards } from '../artRewards';
import { getTodayKey } from '../economy';
import { migrateStarProfile } from '../starPatrol';


interface ProfileContextType {
  profile: any;
  updateProfile: (updates: any) => void;
  refreshProfileFromEngine: () => void;
  clearProfile: () => void;
  addNotification: (title: string, message: string, type?: string) => void;
  markNotificationRead: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cdeState, setCdeState] = useState(CDE.getState());
  const checkInFlight = React.useRef('');
  useEffect(() => {
    const checkIn = () => {
      const state = CDE.getState();
      const day = getTodayKey(), key = `${state.account?.id}:${day}`;
      if (!state.initialized || !state.account || !state.profile || state.profile.profile_data?.profile?.artCheckInDay === day || checkInFlight.current === key) return;
      checkInFlight.current = key;
      CDE.queueMutation('DAILY_CHECK_IN', {}).catch(() => { checkInFlight.current = ''; });
    };
    checkIn();
    const timer = window.setInterval(checkIn, 60000);
    return () => window.clearInterval(timer);
  }, [cdeState.initialized, cdeState.account?.id, cdeState.profile]);

  useEffect(() => {
    const unsub = CDE.subscribe(() => {
      setCdeState(CDE.getState());
    });
    return unsub;
  }, []);

  // Generate the single source of truth profile directly from CDE
  const derivedProfile = useMemo(() => {
      const base = getDefaultProfile();
      
      if (cdeState.profile) {
          base.coins = cdeState.profile.permen; // Map permen to legacy coins UI
          
          if (cdeState.account?.username) {
              base.playerName = cdeState.account.username;
          }
          
          if (cdeState.account?.id) {
              base.id = cdeState.account.id.split('-')[0].toUpperCase();
          }
          
          if (cdeState.profile.profile_data?.profile) {
              const cdeProf = cdeState.profile.profile_data.profile;
              // Merge all flat fields from CDE into base (single currency: permen is the only balance)
              const { coins: _legacyCoins, permen: _legacyPermen, ...flatProf } = cdeProf;
              Object.assign(base, flatProf);
              base.coins = cdeState.profile.permen;
              
              if (cdeProf.avatar) {
                  base.avatar = cdeProf.avatar;
                  base.activeAvatarId = cdeProf.activeAvatarId || cdeProf.avatar;
              }
              if (cdeProf.avatarCollection) {
                  base.avatarCollection = cdeProf.avatarCollection;
              }
          }
      }
      
      return unlockArtRewards(migrateStarProfile(base));
  }, [cdeState]);

  const clearProfile = useCallback(() => {
    // No-op for legacy local state, CDE handles its own logout clearing
  }, []);

  const refreshProfileFromEngine = useCallback(() => {
    const cdeSt = CDE.getState();
    if (cdeSt.initialized && cdeSt.profile && cdeSt.profile.profile_data?.profile) {
        let gameData = { ...getDefaultProfile(), ...cdeSt.profile.profile_data.profile };
        const playerName = cdeSt.account?.username || 'Player';
    }
  }, []);

  const updateProfile = useCallback((updates: any) => {
      const prev = derivedProfile;
      let resolvedUpdates = typeof updates === 'function' ? updates(prev) : updates;
      
      if (CDE.getState().initialized && CDE.getState().account && CDE.getState().profile) {
          const cdeUpdates: any = { ...resolvedUpdates };
          
          // Currency has no generic setter. Only server-priced actions may change it.
          delete cdeUpdates.coins;
          delete cdeUpdates.permen;
          
          if (Object.keys(cdeUpdates).length > 0) {
              CDE.queueMutation('UPDATE_PROFILE', cdeUpdates);
          }
      }
  }, [derivedProfile]);


  const addNotification = useCallback((title: string, message: string, type: string = 'info') => {
      const prev = derivedProfile;
      const newNotif = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false
      };
      
      const isDuplicate = prev.notifications?.some(
        (n: any) => n.title === title && n.message === message && (Date.now() - n.timestamp < 10000)
      );
      
      if (isDuplicate) return;
      
      const nextNotifications = [newNotif, ...(prev.notifications || [])].slice(0, 50);
      
      if (CDE.getState().initialized && CDE.getState().account) {
          CDE.queueMutation('UPDATE_PROFILE', { notifications: nextNotifications });
      }
  }, [derivedProfile]);

  const markNotificationRead = useCallback((id: string) => {
      const prev = derivedProfile;
      if (!prev.notifications) return;
      
      const nextNotifications = prev.notifications.map((n: any) => n.id === id ? { ...n, read: true } : n);
      
      if (CDE.getState().initialized && CDE.getState().account) {
          CDE.queueMutation('UPDATE_PROFILE', { notifications: nextNotifications });
      }
  }, [derivedProfile]);

  return (
    <ProfileContext.Provider value={{ profile: derivedProfile, updateProfile, refreshProfileFromEngine, clearProfile, addNotification, markNotificationRead }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
