import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserById } from '@/services';
import type { User } from '@/types';

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function useUser(id: string | undefined): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    const userId = id;
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getUserById(userId);
        if (!cancelled) {
          if (data) {
            setUser(data);
          } else {
            setUser(null);
            setNotFound(true);
          }
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải thông tin người dùng.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchUser();

    return () => {
      cancelled = true;
    };
  }, [id, fetchKey]);

  return useMemo(
    () => ({
      user: id ? user : null,
      loading: id ? loading : false,
      error: id ? error : null,
      notFound: !id || notFound,
      refetch,
    }),
    [id, user, loading, error, notFound, refetch],
  );
}
