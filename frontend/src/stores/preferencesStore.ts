import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Train } from '../types';

interface PreferencesState {
  recentSearches: Train[];
  favouriteTrains: Train[];
  addRecentSearch: (train: Train) => void;
  clearRecentSearches: () => void;
  toggleFavourite: (train: Train) => void;
  isFavourite: (trainId: string) => boolean;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      recentSearches: [
        { id: '12301', number: '12301', name: 'Howrah - New Delhi Rajdhani Express', source: 'Howrah Jn (HWH)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1451, type: 'Rajdhani' },
        { id: '12951', number: '12951', name: 'Mumbai Central - New Delhi Rajdhani Express', source: 'Mumbai Central (MMCT)', destination: 'New Delhi (NDLS)', totalDistanceKm: 1386, type: 'Rajdhani' }
      ],
      favouriteTrains: [],

      addRecentSearch: (train: Train) => {
        set((state) => {
          const filtered = state.recentSearches.filter(t => t.id !== train.id);
          return { recentSearches: [train, ...filtered].slice(0, 10) };
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      toggleFavourite: (train: Train) => {
        set((state) => {
          const exists = state.favouriteTrains.some(t => t.id === train.id);
          if (exists) {
            return { favouriteTrains: state.favouriteTrains.filter(t => t.id !== train.id) };
          }
          return { favouriteTrains: [...state.favouriteTrains, train] };
        });
      },

      isFavourite: (trainId: string) => {
        return get().favouriteTrains.some(t => t.id === trainId);
      }
    }),
    {
      name: 'trackrail:preferences'
    }
  )
);
