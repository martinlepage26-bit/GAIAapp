/**
 * GAIA — User preferences store (Zustand + AsyncStorage).
 *
 * Persisted preferences:
 *   - lang ('en' | 'fr')
 *   - hemisphere ('N' | 'S') default for create-chart
 *   - hasHydrated — internal flag so consumers can wait for persisted state
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePrefsStore = create(
  persist(
    (set) => ({
      lang: 'en',
      hemisphere: 'N',
      hasHydrated: false,
      setLang: (lang) => set({ lang }),
      setHemisphere: (hemisphere) => set({ hemisphere }),
      _setHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'gaia-prefs-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({ lang: state.lang, hemisphere: state.hemisphere }),
      onRehydrateStorage: () => (state) => {
        // Mark hydrated so consumers waiting on it can render.
        state?._setHydrated(true);
      },
    }
  )
);
