import { createContext, useContext } from 'react';
import type { ApiStatusSnapshot } from '@/lib/apiStatus';

export interface ApiStatusContextValue extends ApiStatusSnapshot {
  recheck: () => Promise<void>;
  checking: boolean;
}

export const ApiStatusContext = createContext<ApiStatusContextValue | null>(null);

export function useApiStatus(): ApiStatusContextValue {
  const context = useContext(ApiStatusContext);
  if (!context) {
    throw new Error('useApiStatus must be used within ApiStatusProvider');
  }
  return context;
}
