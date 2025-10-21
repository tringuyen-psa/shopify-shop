import { useState, useCallback } from 'react';
import { dataService } from '@/services/data-service';

// Custom hook for managing data request states and loading
export function useDataRequests() {
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const addRequest = useCallback((requestId: string) => {
    setPendingRequests(prev => new Set(prev).add(requestId));
  }, []);

  const removeRequest = useCallback((requestId: string) => {
    setPendingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  }, []);

  const isRequestPending = useCallback((requestId: string) => {
    return pendingRequests.has(requestId);
  }, [pendingRequests]);

  return {
    addRequest,
    removeRequest,
    isRequestPending
  };
}