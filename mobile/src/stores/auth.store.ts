import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, LoginDto, RegisterDto } from '../types';
import { authApi } from '../api/auth.api';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import { useFavoritesStore } from './favorites.store';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

const saveTokens = async (accessToken: unknown, refreshToken: unknown) => {
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('El servidor no devolvió un token de acceso válido');
  }
  if (typeof refreshToken !== 'string' || !refreshToken) {
    throw new Error('El servidor no devolvió un refresh token válido');
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(dto);
      await saveTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(', ') : (raw ?? err?.message ?? 'Error al iniciar sesión');
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  register: async (dto) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(dto);
      await saveTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(', ') : (raw ?? err?.message ?? 'Ocurrió un error inesperado');
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    useFavoritesStore.setState({ favorites: [], favoriteIds: new Set() });
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadUser: async () => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (!token) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
