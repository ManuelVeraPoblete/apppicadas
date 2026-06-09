import { create } from 'zustand';
import { NearbyPlace, Place, Category, NearbyQuery } from '../types';
import { placesApi, categoriesApi } from '../api';

interface PlacesState {
  nearbyPlaces: NearbyPlace[];
  categories: Category[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;

  fetchNearby: (query: NearbyQuery) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (id: string | null) => void;
}

export const usePlacesStore = create<PlacesState>((set, get) => ({
  nearbyPlaces: [],
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,

  fetchNearby: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const places = await placesApi.getNearby(query);
      set({ nearbyPlaces: places, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Error al cargar picadas', isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await categoriesApi.getAll();
      set({ categories });
    } catch {
      set({ error: 'No se pudieron cargar las categorías' });
    }
  },

  setSelectedCategory: (id) => set({ selectedCategory: id }),
}));
