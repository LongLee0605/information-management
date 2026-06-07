import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/atoms/Avatar';
import { Text } from '@/components/atoms/Text';
import { userAccountPath } from '@/constants';
import { formatCitizenId, formatCurrency } from '@/utils';
import type { User } from '@/types';
import { cn } from '@/utils';

interface UserCardProps {
  user: User;
  className?: string;
}

export const UserCard = memo(function UserCard({ user, className }: UserCardProps) {
  return (
    <Link
      to={userAccountPath(user.id)}
      className={cn(
        'group glass-card glass-card-hover block rounded-2xl p-6',
        'outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
        className,
      )}
      aria-label={`Xem chi tiết ${user.fullName}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="transition-transform duration-300 group-hover:scale-105">
          <Avatar src={user.avatar} alt={user.fullName} size="lg" />
        </div>

        <Text as="h3" variant="h3" className="mt-5 group-hover:text-accent-light transition-colors">
          {user.fullName}
        </Text>

        <Text variant="caption" className="mt-2 font-mono text-[11px] tracking-wide">
          {formatCitizenId(user.citizenId)}
        </Text>

        <span className="mt-4 inline-flex rounded-full border border-accent/20 bg-accent-muted px-3 py-1 text-xs font-medium text-accent-light">
          {user.occupation}
        </span>

        <Text variant="caption" className="mt-4 text-muted">
          TB {formatCurrency(user.monthlyIncomeAvg)}/tháng
        </Text>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1 text-xs font-medium text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
        Xem chi tiết
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
});
