import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SelectedUserContext } from '@/context/selectedUserContext';

export function SelectedUserProvider({ children }: { children: ReactNode }) {
  const [contextUserId, setContextUserIdState] = useState<string | null>(null);

  const setContextUserId = useCallback((userId: string | null) => {
    setContextUserIdState(userId);
  }, []);

  const value = useMemo(
    () => ({
      contextUserId,
      setContextUserId,
    }),
    [contextUserId, setContextUserId],
  );

  return (
    <SelectedUserContext.Provider value={value}>
      {children}
    </SelectedUserContext.Provider>
  );
}
