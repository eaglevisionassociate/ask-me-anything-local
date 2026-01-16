import { useState, useEffect, useCallback } from 'react';

const REFRESH_INTERVAL_MS = 1.5 * 60 * 60 * 1000; // 1.5 hours in milliseconds
const SESSION_START_KEY = 'app_session_start';
const LAST_REFRESH_KEY = 'last_questions_refresh';

export const useAutoRefresh = () => {
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(REFRESH_INTERVAL_MS);
  const [refreshCount, setRefreshCount] = useState(0);

  // Initialize session start time
  useEffect(() => {
    const existingSessionStart = sessionStorage.getItem(SESSION_START_KEY);
    
    if (!existingSessionStart) {
      // New session - set start time
      const now = Date.now();
      sessionStorage.setItem(SESSION_START_KEY, now.toString());
      sessionStorage.setItem(LAST_REFRESH_KEY, now.toString());
    }
  }, []);

  // Check if it's time to refresh
  const checkRefreshTime = useCallback(() => {
    const lastRefresh = sessionStorage.getItem(LAST_REFRESH_KEY);
    if (!lastRefresh) return false;

    const timeSinceLastRefresh = Date.now() - parseInt(lastRefresh);
    return timeSinceLastRefresh >= REFRESH_INTERVAL_MS;
  }, []);

  // Calculate time remaining until next refresh
  const calculateTimeRemaining = useCallback(() => {
    const lastRefresh = sessionStorage.getItem(LAST_REFRESH_KEY);
    if (!lastRefresh) return REFRESH_INTERVAL_MS;

    const timeSinceLastRefresh = Date.now() - parseInt(lastRefresh);
    const remaining = REFRESH_INTERVAL_MS - timeSinceLastRefresh;
    return Math.max(0, remaining);
  }, []);

  // Mark refresh as completed
  const markRefreshComplete = useCallback(() => {
    const now = Date.now();
    sessionStorage.setItem(LAST_REFRESH_KEY, now.toString());
    setShouldRefresh(false);
    setRefreshCount(prev => prev + 1);
    setTimeUntilRefresh(REFRESH_INTERVAL_MS);
  }, []);

  // Reset timer (called when user manually refreshes questions)
  const resetRefreshTimer = useCallback(() => {
    const now = Date.now();
    sessionStorage.setItem(LAST_REFRESH_KEY, now.toString());
    setShouldRefresh(false);
    setTimeUntilRefresh(REFRESH_INTERVAL_MS);
  }, []);

  // Main timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (checkRefreshTime()) {
        setShouldRefresh(true);
      }
      setTimeUntilRefresh(calculateTimeRemaining());
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [checkRefreshTime, calculateTimeRemaining]);

  // Format time remaining as HH:MM:SS
  const formatTimeRemaining = useCallback(() => {
    const hours = Math.floor(timeUntilRefresh / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilRefresh % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilRefresh % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [timeUntilRefresh]);

  return {
    shouldRefresh,
    timeUntilRefresh,
    formattedTimeRemaining: formatTimeRemaining(),
    refreshCount,
    markRefreshComplete,
    resetRefreshTimer
  };
};
