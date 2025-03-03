import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/models';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface JwtPayload {
  userId: string;
  exp: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.login(email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.register(username, email, password);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isAuthenticated: false,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const token = get().token;
        if (!token) return false;

        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            get().logout();
            return false;
          }

          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },
      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.updateProfile(userData);
          
          set((state) => ({ 
            ...state,
            user: { ...state.user, ...response.user },
            isLoading: false 
          }));
          return response.user;
        } catch (error) {
          set((state) => ({ 
            ...state,
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false 
          }));
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Subscribe to store changes
useAuthStore.subscribe((state) => {
  if (state.token) {
    localStorage.setItem('token', state.token);
  }
});
