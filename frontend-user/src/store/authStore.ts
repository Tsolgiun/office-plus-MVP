import { create } from 'zustand';
import { User, Building, Office } from '../types/models';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  favorites: {
    buildings: Building[];
    offices: Office[];
  };
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  toggleBuildingFavorite: (buildingId: string) => Promise<boolean | undefined>;
  toggleOfficeFavorite: (officeId: string) => Promise<boolean | undefined>;
  isBuildingFavorited: (buildingId: string) => boolean;
  isOfficeFavorited: (officeId: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  favorites: {
    buildings: [],
    offices: []
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      set({ user: response.user, isLoggedIn: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed', isLoading: false });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(username, email, password);
      set({ user: response.user, isLoggedIn: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({ 
      user: null, 
      isLoggedIn: false,
      favorites: { buildings: [], offices: [] }
    });
  },

  loadUser: async () => {
    if (!localStorage.getItem('token')) return;
    
    set({ isLoading: true, error: null });
    try {
      const user = await api.getUserProfile();
      set({ user, isLoggedIn: true, isLoading: false });
      // Load favorites after successful user load
      await get().loadFavorites();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load user', isLoading: false });
      // Clear everything if token is invalid
      localStorage.removeItem('token');
      set({ 
        user: null, 
        isLoggedIn: false, 
        isLoading: false,
        favorites: { buildings: [], offices: [] }
      });
    }
  },

  loadFavorites: async () => {
    if (!get().isLoggedIn) return;

    try {
      const favorites = await api.getFavorites();
      set({ favorites });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load favorites' });
    }
  },

  toggleBuildingFavorite: async (buildingId: string) => {
    if (!get().isLoggedIn) return;

    try {
      const response = await api.toggleBuildingFavorite(buildingId);
      const favorites = await api.getFavorites();
      set({ favorites });
      return response.favorited;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle building favorite' });
    }
  },

  toggleOfficeFavorite: async (officeId: string) => {
    if (!get().isLoggedIn) return;

    try {
      const response = await api.toggleOfficeFavorite(officeId);
      const favorites = await api.getFavorites();
      set({ favorites });
      return response.favorited;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle office favorite' });
    }
  },

  isBuildingFavorited: (buildingId: string) => {
    const state = get();
    return state.favorites.buildings.some(building => building._id === buildingId);
  },

  isOfficeFavorited: (officeId: string) => {
    const state = get();
    return state.favorites.offices.some(office => office._id === officeId);
  },
}));
