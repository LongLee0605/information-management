import { createContext, useContext } from 'react';

export interface SelectedUserContextValue {
  contextUserId: string | null;
  setContextUserId: (userId: string | null) => void;
}

export const SelectedUserContext = createContext<SelectedUserContextValue | null>(null);

export function useSelectedUserContext(): SelectedUserContextValue {
  const context = useContext(SelectedUserContext);
  if (!context) {
    throw new Error('useSelectedUserContext must be used within SelectedUserProvider');
  }
  return context;
}
