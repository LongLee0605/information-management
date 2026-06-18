import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { checkApiHealth } from '@/lib/api';
import { warmApiAccountCache } from '@/services/accountService';
import { getApiStatusSnapshot, subscribeApiStatus, updateApiStatus, type ApiStatusSnapshot, } from '@/lib/apiStatus';
import { ApiStatusContext } from '@/context/apiStatusContext';
const HEALTH_POLL_MS = 30000;
interface ApiStatusProviderProps {
    children: ReactNode;
}
export function ApiStatusProvider({ children }: ApiStatusProviderProps) {
    const [snapshot, setSnapshot] = useState<ApiStatusSnapshot>(getApiStatusSnapshot);
    const [checking, setChecking] = useState(true);
    const recheck = useCallback(async () => {
        setChecking(true);
        updateApiStatus({ status: 'checking' });
        const result = await checkApiHealth();
        if (result.status === 'ok') {
            await warmApiAccountCache();
        }
        setChecking(false);
    }, []);
    useEffect(() => {
        return subscribeApiStatus(() => {
            setSnapshot(getApiStatusSnapshot());
        });
    }, []);
    useEffect(() => {
        void recheck();
        const intervalId = window.setInterval(() => {
            void recheck();
        }, HEALTH_POLL_MS);
        return () => {
            window.clearInterval(intervalId);
        };
    }, [recheck]);
    const value = useMemo(() => ({
        ...snapshot,
        checking,
        recheck,
    }), [snapshot, checking, recheck]);
    return (<ApiStatusContext.Provider value={value}>
      {children}
    </ApiStatusContext.Provider>);
}
