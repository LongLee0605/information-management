import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/templates/Sidebar';
import { APP_NAME, ROUTES } from '@/constants';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-page-bg">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <Link to={ROUTES.HOME} className="text-sm font-bold text-white">
            {APP_NAME}
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>

        <footer className="border-t border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
            <p>© 2026 {APP_NAME}. Bảo lưu mọi quyền.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="#" className="hover:text-primary-600">
                Chính Sách Bảo Mật
              </Link>
              <Link to="#" className="hover:text-primary-600">
                Điều Khoản Dịch Vụ
              </Link>
              <Link to="#" className="hover:text-primary-600">
                Liên hệ
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
