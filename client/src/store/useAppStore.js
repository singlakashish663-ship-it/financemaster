import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Settings
      soundEnabled: true,
      musicEnabled: true,
      reducedMotion: false,
      theme: 'dark',
      currency: 'INR',
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setMusicEnabled: (v) => set({ musicEnabled: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setCurrency: (v) => set({ currency: v }),

      // UI State
      sidebarOpen: false,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // Notifications
      notifications: [],
      addNotification: (n) =>
        set((s) => ({ notifications: [{ id: Date.now(), ...n }, ...s.notifications].slice(0, 20) })),
      clearNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
      clearAllNotifications: () => set({ notifications: [] }),

      // Trading state (local cache)
      watchlist: [],
      setWatchlist: (list) => set({ watchlist: list }),
      addToWatchlist: (stock) =>
        set((s) => ({ watchlist: s.watchlist.find((w) => w._id === stock._id) ? s.watchlist : [...s.watchlist, stock] })),
      removeFromWatchlist: (id) =>
        set((s) => ({ watchlist: s.watchlist.filter((w) => w._id !== id) })),

      // Game progress cache
      lastWorld: null,
      lastMission: null,
      setLastWorld: (id) => set({ lastWorld: id }),
      setLastMission: (id) => set({ lastMission: id }),

      // Streak
      streak: 0,
      lastActiveDate: null,
      setStreak: (v) => set({ streak: v }),
      setLastActiveDate: (d) => set({ lastActiveDate: d }),
    }),
    {
      name: 'financequest-app',
      partialize: (s) => ({
        soundEnabled: s.soundEnabled,
        musicEnabled: s.musicEnabled,
        reducedMotion: s.reducedMotion,
        currency: s.currency,
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        lastWorld: s.lastWorld,
        lastMission: s.lastMission,
      }),
    }
  )
);
