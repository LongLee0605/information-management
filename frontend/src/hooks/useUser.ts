import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserById } from '@/services';
import type { User } from '@/types';
import { useRouteUserId } from '@/hooks/useRouteUserId';
import { subscribeDataChange } from '@/utils/dataChangeBus';

interface UseUserResult {
    user: User | null;
    userId: string | undefined;
    loading: boolean;
    error: string | null;
    notFound: boolean;
    refetch: () => void;
}

export function useUser(routeParam: string | undefined): UseUserResult {
    const { userId, resolving } = useRouteUserId(routeParam);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(Boolean(routeParam));
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [fetchKey, setFetchKey] = useState(0);

    const refetch = useCallback(() => {
        setFetchKey((key) => key + 1);
    }, []);

    useEffect(() => {
        return subscribeDataChange('users', () => {
            setFetchKey((key) => key + 1);
        });
    }, []);

    useEffect(() => {
        if (!routeParam) {
            setUser(null);
            setLoading(false);
            setError(null);
            setNotFound(false);
            return;
        }

        if (resolving) {
            setLoading(true);
            setError(null);
            setNotFound(false);
            return;
        }

        if (!userId) {
            setUser(null);
            setLoading(false);
            setError(null);
            setNotFound(true);
            return;
        }

        const activeUserId = userId;
        let cancelled = false;

        async function fetchUser() {
            setLoading(true);
            setError(null);
            setNotFound(false);
            try {
                const data = await getUserById(activeUserId);
                if (!cancelled) {
                    if (data) {
                        setUser(data);
                    }
                    else {
                        setUser(null);
                        setNotFound(true);
                    }
                }
            }
            catch {
                if (!cancelled) {
                    setError('Không thể tải thông tin người dùng.');
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchUser();
        return () => {
            cancelled = true;
        };
    }, [routeParam, userId, resolving, fetchKey]);

    return useMemo(() => ({
        user: userId ? user : null,
        userId,
        loading: Boolean(routeParam && (resolving || loading)),
        error: userId ? error : null,
        notFound: Boolean(routeParam && !resolving && (!userId || notFound)),
        refetch,
    }), [routeParam, userId, user, resolving, loading, error, notFound, refetch]);
}
