import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  checkTokenExpiry: () => boolean;
  initializeAuth: () => void;
  getTokenExpiryTime: () => number | null;
}

interface JWTPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true; // If we can't decode, consider it expired
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear from localStorage as well
        localStorage.removeItem('auth_token');
      },

      checkTokenExpiry: () => {
        const { token } = get();
        if (!token) {
          return false;
        }

        if (isTokenExpired(token)) {
          get().logout();
          return false;
        }

        return true;
      },

      getTokenExpiryTime: () => {
        const { token } = get();
        if (!token) return null;
        
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          return decoded.exp * 1000; // Convert to milliseconds
        } catch {
          return null;
        }
      },

      initializeAuth: () => {
        const { token, checkTokenExpiry } = get();
        
        if (token) {
          // Check if token is still valid
          const isValid = checkTokenExpiry();
          set({ isLoading: false, isAuthenticated: isValid });
        } else {
          // Check localStorage for token (fallback for existing users)
          const storedToken = localStorage.getItem('auth_token');
          if (storedToken) {
            if (isTokenExpired(storedToken)) {
              localStorage.removeItem('auth_token');
              set({ isLoading: false, isAuthenticated: false });
            } else {
              // Token exists and is valid, but we don't have user data
              // This will be handled by the API service
              set({ 
                token: storedToken, 
                isAuthenticated: true, 
                isLoading: false 
              });
            }
          } else {
            set({ isLoading: false, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);