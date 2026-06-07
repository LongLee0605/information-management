import { Skeleton } from '@/components/atoms/Skeleton';
import { UserCard } from '@/components/molecules/UserCard';
import type { User } from '@/types';

export function UserGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center rounded-2xl border border-border bg-white p-5"
        >
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="mt-4 h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-40" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

interface UserGridWithDataProps {
  users: User[];
}

export function UserGridWithData({ users }: UserGridWithDataProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
