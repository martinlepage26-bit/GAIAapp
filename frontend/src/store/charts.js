/**
 * GAIA — Saved Charts store (Zustand + AsyncStorage persistence).
 *
 * Stores up to 50 user-saved charts (their own + loved ones).
 * Each entry preserves enough info to fully re-render result.tsx without re-asking:
 *   - chart (full computed payload from src/lib/chart.js)
 *   - birthHour (optional, used to fetch birth-trio)
 *   - label (display name, e.g. "Me" or "Marie")
 *   - createdAt (ISO timestamp)
 *   - lang at save time (so we can warn if user switches lang)
 *   - notes (optional free text)
 *
 * No network — pure local persistence.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_CHARTS = 50;

function genId() {
  // RFC 4122-ish lightweight (no crypto dependency)
  return 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export const useChartsStore = create(
  persist(
    (set, get) => ({
      charts: [],

      /** Save a new chart. Returns the generated id. */
      saveChart: ({ chart, birthHour, label, notes, lang }) => {
        const id = genId();
        const entry = {
          id,
          chart,
          birthHour: typeof birthHour === 'number' ? birthHour : null,
          label: (label || '').trim() || (chart?.sign?.en?.name || 'Chart'),
          notes: (notes || '').trim(),
          createdAt: new Date().toISOString(),
          lang: lang || 'en',
        };
        const next = [entry, ...get().charts].slice(0, MAX_CHARTS);
        set({ charts: next });
        return id;
      },

      /** Update fields (label, notes) of an existing chart by id. */
      updateChart: (id, patch) => {
        set({
          charts: get().charts.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
          ),
        });
      },

      /** Remove a chart by id. */
      removeChart: (id) => {
        set({ charts: get().charts.filter((c) => c.id !== id) });
      },

      /** Wipe all saved charts (used by Settings). */
      clearAll: () => set({ charts: [] }),

      /** Find a saved chart by id. */
      getChart: (id) => get().charts.find((c) => c.id === id) || null,

      /** Detect duplicates — same birth_date + same birthHour. */
      findDuplicate: ({ chart, birthHour }) => {
        if (!chart) return null;
        const targetHour = typeof birthHour === 'number' ? birthHour : null;
        return (
          get().charts.find(
            (c) =>
              c.chart?.birth_date === chart.birth_date && c.birthHour === targetHour
          ) || null
        );
      },
    }),
    {
      name: 'gaia-charts-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({ charts: state.charts }),
    }
  )
);
