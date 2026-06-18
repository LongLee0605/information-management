import { useMemo, useState } from 'react';
import { UserCard } from '@/components/molecules/UserCard';
import { Pagination } from '@/components/molecules/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import type { User } from '@/types';
import { cn } from '@/utils';
interface UserGridProps {
    users: User[];
    className?: string;
    pageSize?: number;
    paginate?: boolean;
    paginationResetKey?: string | number;
    itemLabel?: string;
}
interface UserGridPageProps {
    users: User[];
    className?: string;
    pageSize: number;
    paginate: boolean;
    itemLabel: string;
}
function UserGridPage({ users, className, pageSize, paginate, itemLabel, }: UserGridPageProps) {
    const [page, setPage] = useState(1);
    const shouldPaginate = paginate && users.length > pageSize;
    const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const visibleUsers = useMemo(() => {
        if (!shouldPaginate) {
            return users;
        }
        const start = (currentPage - 1) * pageSize;
        return users.slice(start, start + pageSize);
    }, [users, shouldPaginate, currentPage, pageSize]);
    return (<div className={cn('dashboard-card overflow-hidden', className)}>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {visibleUsers.map((user) => (<UserCard key={user.id} user={user}/>))}
      </div>

      {shouldPaginate && (<Pagination page={currentPage} totalPages={totalPages} totalItems={users.length} pageSize={pageSize} itemLabel={itemLabel} onPageChange={setPage}/>)}
    </div>);
}
export function UserGrid({ users, className, pageSize = DEFAULT_PAGE_SIZE, paginate = true, paginationResetKey = '', itemLabel = 'khách hàng', }: UserGridProps) {
    return (<UserGridPage key={paginationResetKey} users={users} className={className} pageSize={pageSize} paginate={paginate} itemLabel={itemLabel}/>);
}
