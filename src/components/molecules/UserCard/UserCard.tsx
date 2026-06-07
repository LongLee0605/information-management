import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/atoms/Avatar';
import { Text } from '@/components/atoms/Text';
import { userDetailPath } from '@/constants';
import { formatCitizenId } from '@/utils';
import type { User } from '@/types';
import { cn } from '@/utils';

interface UserCardProps {
  user: User;
  className?: string;
}

export const UserCard = memo(function UserCard({ user, className }: UserCardProps) {
  return (
    <Link
      to={userDetailPath(user.id)}
      className={cn(
        'group flex flex-col items-center rounded-2xl border border-border bg-white p-5 shadow-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        className,
      )}
      aria-label={`Xem chi tiết ${user.fullName}`}
    >
      <Avatar src={user.avatar} alt={user.fullName} size="lg" />
      <Text as="h3" variant="h3" className="mt-4 text-center">
        {user.fullName}
      </Text>
      <Text variant="caption" className="mt-1 text-center">
        CCCD: {formatCitizenId(user.citizenId)}
      </Text>
      <Text variant="caption" className="mt-2 text-center text-primary-600">
        {user.occupation}
      </Text>
    </Link>
  );
});
