import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { SelectedUserContext } from '@/context/selectedUserContext';

const STORAGE_KEY = 'qltt:selectedUserId';

function readStoredUserId(): string | null {
    try {
        return sessionStorage.getItem(STORAGE_KEY);
    }
    catch {
        return null;
    }
}

function writeStoredUserId(userId: string | null): void {
    try {
        if (userId) {
            sessionStorage.setItem(STORAGE_KEY, userId);
        }
        else {
            sessionStorage.removeItem(STORAGE_KEY);
        }
    }
    catch {
        // ignore quota / private mode
    }
}

export function SelectedUserProvider({ children }: {
    children: ReactNode;
}) {
    const [contextUserId, setContextUserIdState] = useState<string | null>(() => readStoredUserId());
    const setContextUserId = useCallback((userId: string | null) => {
        writeStoredUserId(userId);
        setContextUserIdState(userId);
    }, []);
    const value = useMemo(() => ({
        contextUserId,
        setContextUserId,
    }), [contextUserId, setContextUserId]);
    return (<SelectedUserContext.Provider value={value}>
      {children}
    </SelectedUserContext.Provider>);
}
