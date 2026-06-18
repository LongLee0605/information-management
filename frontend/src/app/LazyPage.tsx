import { Suspense, type ReactNode } from 'react';
import { PageLoading } from '@/components/templates/PageLoading';
interface LazyPageProps {
    children: ReactNode;
}
export function LazyPage({ children }: LazyPageProps) {
    return <Suspense fallback={<PageLoading />}>{children}</Suspense>;
}
