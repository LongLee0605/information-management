import { UserCard } from '@/components/molecules/UserCard';
import type { User } from '@/types';
import { cn } from '@/utils';

interface UserGridProps {
  users: User[];
  className?: string;
}

export function UserGrid({ users, className }: UserGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
