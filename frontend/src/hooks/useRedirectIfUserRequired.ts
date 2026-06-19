import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function useRedirectIfUserRequired(notFound: boolean, loading: boolean): void {
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && notFound) {
            navigate(`${ROUTES.HOME}?notice=select-customer`, { replace: true });
        }
    }, [loading, notFound, navigate]);
}
