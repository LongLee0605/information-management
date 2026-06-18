import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUsers } from '@/services';
import type { User } from '@/types';
import { subscribeDataChange } from '@/utils/dataChangeBus';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError(null);

      try {
        const data = await getUsers();
        if (!cancelled) {
          setUsers(data);
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải danh sách người dùng.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  return useMemo(
    () => ({ users, loading, error, refetch }),
    [users, loading, error, refetch],
  );
}
