import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuthCheck() {
  const { checkTokenExpiry, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token expiry immediately
    checkTokenExpiry();

    // Set up periodic checks
    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkTokenExpiry, isAuthenticated]);
}