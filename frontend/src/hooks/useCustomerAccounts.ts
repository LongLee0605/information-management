import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCustomerBankAccountsByUserId } from '@/services/accountService';
import type { EnrichedBankAccount } from '@/types';
import { subscribeDataChange } from '@/utils/dataChangeBus';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';
interface UseCustomerAccountsResult {
    accounts: EnrichedBankAccount[];
    userId: string | undefined;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}
export function useCustomerAccounts(routeParam: string | undefined): UseCustomerAccountsResult {
    const userId = useMemo(() => resolveUserIdFromRouteParam(routeParam), [routeParam]);
    const [accounts, setAccounts] = useState<EnrichedBankAccount[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState<string | null>(null);
    const [fetchKey, setFetchKey] = useState(0);
    const refetch = useCallback(() => {
        setFetchKey((key) => key + 1);
    }, []);
    useEffect(() => {
        const refetchAccounts = () => setFetchKey((key) => key + 1);
        const unsubscribeAccount = subscribeDataChange('accounts', refetchAccounts);
        const unsubscribeTransaction = subscribeDataChange('transactions', refetchAccounts);
        return () => {
            unsubscribeAccount();
            unsubscribeTransaction();
        };
    }, []);
    useEffect(() => {
        if (!userId) {
            return;
        }
        const activeUserId = userId;
        let cancelled = false;
        async function fetchAccounts() {
            setLoading(true);
            setError(null);
            try {
                const data = await getCustomerBankAccountsByUserId(activeUserId);
                if (!cancelled) {
                    setAccounts(data);
                }
            }
            catch {
                if (!cancelled) {
                    setError('Không thể tải danh sách tài khoản.');
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        void fetchAccounts();
        return () => {
            cancelled = true;
        };
    }, [userId, fetchKey]);
    return useMemo(() => ({
        accounts: userId ? accounts : [],
        userId,
        loading: Boolean(routeParam && userId && loading),
        error: userId ? error : null,
        refetch,
    }), [routeParam, userId, accounts, loading, error, refetch]);
}
