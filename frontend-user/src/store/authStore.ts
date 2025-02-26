import { create } from 'zustand';
import { User } from '../types/models';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

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
    set({ user: null, isLoggedIn: false });
  },

  loadUser: async () => {
    if (!localStorage.getItem('token')) return;
    
    set({ isLoading: true, error: null });
    try {
      const user = await api.getUserProfile();
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load user', isLoading: false });
      // Clear everything if token is invalid
      localStorage.removeItem('token');
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },
}));
