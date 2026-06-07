import { Link, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === ROUTES.HOME;

  return (
    <div className="mesh-background flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-surface-glass/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.HOME}
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-accent/20 to-primary-500/20 ring-1 ring-border-strong">
              <span className="text-sm font-bold gradient-text-accent">UF</span>
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold tracking-tight gradient-text">
                User Finance
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                Manager
              </span>
            </div>
          </Link>

          {!isHome && (
            <Link
              to={ROUTES.HOME}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground-soft',
                'transition-all hover:border-accent/30 hover:bg-accent-muted hover:text-accent-light',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span aria-hidden="true">←</span>
              Trang chủ
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children ?? <Outlet />}
      </main>

      <footer className="border-t border-border bg-surface/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted">
            © 2025 User Finance Manager · Quản lý người dùng & thu chi
          </p>
        </div>
      </footer>
    </div>
  );
}
