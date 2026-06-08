import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllCustomerBankAccounts } from '@/services/accountService';
import type { EnrichedBankAccount } from '@/types';
import { subscribeAccountChange } from '@/utils/customerAccountRuntimeStore';
import { subscribeTransactionChange } from '@/utils/transferRuntimeStore';

interface UseAllCustomerAccountsResult {
  accounts: EnrichedBankAccount[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAllCustomerAccounts(): UseAllCustomerAccountsResult {
  const [accounts, setAccounts] = useState<EnrichedBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const refetchAccounts = () => setFetchKey((key) => key + 1);
    const unsubscribeAccount = subscribeAccountChange(refetchAccounts);
    const unsubscribeTransaction = subscribeTransactionChange(refetchAccounts);

    return () => {
      unsubscribeAccount();
      unsubscribeTransaction();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAccounts() {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllCustomerBankAccounts();
        if (!cancelled) {
          setAccounts(data);
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải danh sách tài khoản.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchAccounts();

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  return useMemo(
    () => ({
      accounts,
      loading,
      error,
      refetch,
    }),
    [accounts, loading, error, refetch],
  );
}
