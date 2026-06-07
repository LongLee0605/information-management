import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { Text } from '@/components/atoms/Text';
import { ProfileField } from '@/components/molecules/ProfileField';
import {
  formatCitizenId,
  formatCurrency,
  formatDate,
  formatGender,
} from '@/utils';
import type { User } from '@/types';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="space-y-6">
      <div className="glass-card relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar src={user.avatar} alt={user.fullName} size="xl" />
          <div className="flex-1 text-center sm:text-left">
            <Text as="h2" variant="h2" className="gradient-text">
              {user.fullName}
            </Text>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge>{user.occupation}</Badge>
              <Badge variant="neutral">{user.maritalStatus}</Badge>
            </div>
            <div className="mt-5 inline-flex rounded-xl border border-accent/20 bg-accent-muted px-4 py-2">
              <Text variant="caption" className="text-accent-light">
                Thu nhập trung bình{' '}
                <span className="font-bold">{formatCurrency(user.monthlyIncomeAvg)}</span>/tháng
              </Text>
            </div>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileField label="Số CCCD" value={formatCitizenId(user.citizenId)} />
        <ProfileField label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
        <ProfileField label="Giới tính" value={formatGender(user.gender)} />
        <ProfileField label="Số điện thoại" value={user.phone} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Học vấn" value={user.education} />
        <ProfileField label="Nghề nghiệp" value={user.occupation} />
        <ProfileField label="Nơi làm việc" value={user.workplace} />
        <ProfileField label="Địa chỉ" value={user.address} />
      </dl>
    </div>
  );
}
