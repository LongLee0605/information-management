import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRouteUserId } from '@/hooks/useRouteUserId';
import { canonicalizeUserPathname } from '@/utils/userRoute';

export function useCanonicalUserRoute(): string | undefined {
    const { id: routeParam } = useParams<{
        id: string;
    }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { userId, resolving } = useRouteUserId(routeParam);

    useEffect(() => {
        if (!routeParam || !userId || resolving) {
            return;
        }
        const canonicalPath = canonicalizeUserPathname(location.pathname, routeParam, userId);
        if (canonicalPath) {
            navigate(`${canonicalPath}${location.search}${location.hash}`, { replace: true });
        }
    }, [routeParam, userId, resolving, location.pathname, location.search, location.hash, navigate]);

    return userId;
}
