import { useEffect, useState } from 'react';
import { resolveCustomerIdFromRouteParam } from '@/services/userService';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';

export function useRouteUserId(routeParam: string | undefined): {
    userId: string | undefined;
    resolving: boolean;
} {
    const [userId, setUserId] = useState<string | undefined>(() => resolveUserIdFromRouteParam(routeParam));
    const [resolving, setResolving] = useState(() => Boolean(routeParam) && !resolveUserIdFromRouteParam(routeParam));

    useEffect(() => {
        if (!routeParam) {
            setUserId(undefined);
            setResolving(false);
            return;
        }

        const syncId = resolveUserIdFromRouteParam(routeParam);
        if (syncId) {
            setUserId(syncId);
            setResolving(false);
            return;
        }

        let cancelled = false;
        setResolving(true);
        void resolveCustomerIdFromRouteParam(routeParam).then((resolvedId) => {
            if (cancelled) {
                return;
            }
            setUserId(resolvedId ?? undefined);
            setResolving(false);
        });

        return () => {
            cancelled = true;
        };
    }, [routeParam]);

    return { userId, resolving };
}
