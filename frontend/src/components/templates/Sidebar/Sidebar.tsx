import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_NAME, APP_SUBTITLE, ROUTES, userAccountPath, userProfilePath, userReportsPath, userTransactionsPath, } from '@/constants';
import { useActiveUserId } from '@/hooks';
import { ApiStatusIndicator } from '@/components/molecules/ApiStatusIndicator';
import { cn } from '@/utils';
function UsersIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>);
}
function AccountIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>);
}
function ProfileIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>);
}
function TransactionIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>);
}
function ChartIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18"/>
      <path d="M7 16l4-8 4 5 5-9"/>
    </svg>);
}
function TraceIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="18" r="3"/>
      <circle cx="18" cy="6" r="3"/>
      <path d="M8.5 7.5L15.5 16.5M15.5 7.5L8.5 16.5"/>
    </svg>);
}
function ReportIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>);
}
function ChevronIcon({ className, open }: {
    className?: string;
    open?: boolean;
}) {
    return (<svg className={cn(className, open && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6"/>
    </svg>);
}
interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    end?: boolean;
    isActiveMatch?: (pathname: string) => boolean;
}
function NavItem({ to, icon, label, end, isActiveMatch }: NavItemProps) {
    return (<NavLink to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', (isActiveMatch ? isActiveMatch(window.location.pathname) : isActive)
            ? 'bg-sidebar-active text-white'
            : 'text-sidebar-text hover:bg-sidebar-hover')}>
      <span className="h-5 w-5 shrink-0">{icon}</span>
      {label}
    </NavLink>);
}
function DisabledNavItem({ icon, label }: {
    icon: React.ReactNode;
    label: string;
}) {
    return (<span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted opacity-60" title="Chọn khách hàng từ danh sách trước">
      <span className="h-5 w-5 shrink-0">{icon}</span>
      {label}
    </span>);
}
function isTransactionsRoute(pathname: string, userId: string | null): boolean {
    if (userId) {
        return pathname.startsWith(userTransactionsPath(userId));
    }
    return pathname.startsWith('/transactions');
}
function isAccountRoute(pathname: string): boolean {
    return pathname === ROUTES.ACCOUNTS || /^\/users\/[^/]+$/.test(pathname);
}
export function Sidebar() {
    const location = useLocation();
    const userId = useActiveUserId();
    const isAccountPage = isAccountRoute(location.pathname);
    const accountNavTarget = userId ? userAccountPath(userId) : ROUTES.ACCOUNTS;
    const isProfilePage = Boolean(userId && location.pathname === userProfilePath(userId));
    const isTransactionsPage = isTransactionsRoute(location.pathname, userId);
    const isReportsPage = Boolean(userId && location.pathname === userReportsPath(userId));
    const isMoneyTracePage = location.pathname === ROUTES.MONEY_TRACE;
    const isReportsSection = isReportsPage || isMoneyTracePage;
    const [manualReportsOpen, setManualReportsOpen] = useState<boolean | null>(null);
    const reportsOpen = manualReportsOpen ?? isReportsSection;
    return (<aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col bg-sidebar text-sidebar-text md:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <h1 className="text-base font-bold text-white">{APP_NAME}</h1>
        <p className="mt-0.5 text-xs text-sidebar-muted">{APP_SUBTITLE}</p>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4" aria-label="Menu chính">
        <NavItem to={ROUTES.HOME} end icon={<UsersIcon className="h-5 w-5"/>} label="Khách Hàng"/>

        <NavLink to={accountNavTarget} end className={() => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isAccountPage
            ? 'bg-sidebar-active text-white'
            : 'text-sidebar-text hover:bg-sidebar-hover')}>
          <AccountIcon className="h-5 w-5 shrink-0"/>
          Tài Khoản
        </NavLink>

        {userId ? (<NavLink to={userProfilePath(userId)} end className={() => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isProfilePage
                ? 'bg-sidebar-active text-white'
                : 'text-sidebar-text hover:bg-sidebar-hover')}>
            <ProfileIcon className="h-5 w-5 shrink-0"/>
            Hồ Sơ
          </NavLink>) : (<DisabledNavItem icon={<ProfileIcon className="h-5 w-5"/>} label="Hồ Sơ"/>)}

        <NavLink to={userId ? userTransactionsPath(userId) : ROUTES.TRANSACTIONS} className={() => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isTransactionsPage
            ? 'bg-sidebar-active text-white'
            : 'text-sidebar-text hover:bg-sidebar-hover')}>
          <TransactionIcon className="h-5 w-5 shrink-0"/>
          Giao Dịch
        </NavLink>

        <div className="pt-2">
          <button type="button" onClick={() => setManualReportsOpen((open) => !(open ?? isReportsSection))} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-text outline-none transition-colors hover:bg-sidebar-hover" aria-expanded={reportsOpen}>
            <ReportIcon className="h-5 w-5 shrink-0"/>
            <span className="flex-1 text-left">Báo Cáo</span>
            <ChevronIcon className="h-4 w-4 transition-transform" open={reportsOpen}/>
          </button>

          {reportsOpen && (<div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
              {userId ? (<NavLink to={userReportsPath(userId)} className={() => cn('block rounded-lg px-3 py-2 text-sm transition-colors', isReportsPage
                    ? 'bg-sidebar-active font-medium text-white'
                    : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text')}>
                  <span className="flex items-center gap-2">
                    <ChartIcon className="h-4 w-4"/>
                    Tổng Quan
                  </span>
                </NavLink>) : (<span className="block cursor-not-allowed rounded-lg px-3 py-2 text-sm text-sidebar-muted opacity-60" title="Chọn khách hàng từ danh sách trước">
                  <span className="flex items-center gap-2">
                    <ChartIcon className="h-4 w-4"/>
                    Tổng Quan
                  </span>
                </span>)}
              <NavLink to={ROUTES.MONEY_TRACE} className={() => cn('block rounded-lg px-3 py-2 text-sm transition-colors', isMoneyTracePage
                ? 'bg-sidebar-active font-medium text-white'
                : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text')}>
                <span className="flex items-center gap-2">
                  <TraceIcon className="h-4 w-4"/>
                  Truy Vết Dòng Tiền
                </span>
              </NavLink>
            </div>)}
        </div>
      </nav>

      <div className="border-t border-white/10 px-5 py-4 space-y-3">
        <ApiStatusIndicator />
        <p className="text-[11px] leading-relaxed text-sidebar-muted">
          © 2026 {APP_NAME}.
          <br />
          Bảo lưu mọi quyền.
        </p>
      </div>
    </aside>);
}
