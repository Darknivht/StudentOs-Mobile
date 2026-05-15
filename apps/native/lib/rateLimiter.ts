import { useCallback } from "react";

const REQUESTS = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 5;
const BURST_LIMIT = 10;

export function useRateLimiter() {
  const checkLimit = useCallback((key: string): boolean => {
    const now = Date.now();
    const timestamps = REQUESTS.get(key) || [];
    
    // Remove old entries (> 1 minute)
    const oneMinuteAgo = now - 60000;
    const activeRequests = timestamps.filter((t) => t > oneMinuteAgo);
    
    if (activeRequests.length > MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    // Also check burst limit (total in 1 min sliding window)
    if (activeRequests.length > BURST_LIMIT) {
      return false;
    }
    
    activeRequests.push(now);
    REQUESTS.set(key, activeRequests);
    return true;
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      REQUESTS.delete(key);
    } else {
      REQUESTS.clear();
    }
  }, []);

  return { checkLimit, reset };
}
