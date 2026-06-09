import { create } from 'zustand';
import { Place } from '../types';
import { favoritesApi } from '../api';

interface FavoritesState {
  favorites: Place[];
  favoriteIds: Set<string>;
  isLoading: boolean;

  fetchFavorites: () => Promise<void>;
  addFavorite: (placeId: string) => Promise<void>;
  removeFavorite: (placeId: string) => Promise<void>;
  isFavorite: (placeId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const places = await favoritesApi.getAll();
      const ids = new Set(places.map((p) => p.id));
      set({ favorites: places, favoriteIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addFavorite: async (placeId) => {
    set((s) => ({ favoriteIds: new Set([...s.favoriteIds, placeId]) }));
    try {
      await favoritesApi.add(placeId);
      const places = await favoritesApi.getAll();
      set({ favorites: places, favoriteIds: new Set(places.map((p) => p.id)) });
    } catch {
      set((s) => {
        const ids = new Set(s.favoriteIds);
        ids.delete(placeId);
        return { favoriteIds: ids };
      });
    }
  },

  removeFavorite: async (placeId) => {
    await favoritesApi.remove(placeId);
    set((s) => {
      const ids = new Set(s.favoriteIds);
      ids.delete(placeId);
      return { favoriteIds: ids, favorites: s.favorites.filter((p) => p.id !== placeId) };
    });
  },

  isFavorite: (placeId) => get().favoriteIds.has(placeId),
}));
