import { Link, Outlet, useLocation } from 'react-router-dom';
import { Text } from '@/components/atoms/Text';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.HOME}
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <Text as="span" variant="h3" className="text-primary-700">
              User Finance Manager
            </Text>
          </Link>
          {!isHome && (
            <Link
              to={ROUTES.HOME}
              className={cn(
                'text-sm font-medium text-primary-600 hover:text-primary-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1',
              )}
            >
              ← Về trang chủ
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children ?? <Outlet />}
      </main>

      <footer className="border-t border-border bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Text variant="caption" className="text-center">
            © 2025 User Finance Manager — Quản lý người dùng & thu chi
          </Text>
        </div>
      </footer>
    </div>
  );
}
