import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { GenderBadge } from '@/components/atoms/GenderBadge';
import { Text } from '@/components/atoms/Text';
import { ProfileField } from '@/components/molecules/ProfileField';
import {
  formatBirthDate,
  formatCitizenId,
  formatCurrency,
  formatGender,
} from '@/utils';
import type { User } from '@/types';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-center">
        <Avatar src={user.avatar} alt={user.fullName} size="xl" ring gender={user.gender} />
        <div>
          <Text as="h2" variant="h2">
            {user.fullName}
          </Text>
          <div className="mt-3 flex flex-wrap gap-2">
            <GenderBadge gender={user.gender} />
            <Badge variant="neutral">{user.maritalStatus}</Badge>
            <Badge variant="income">
              TB {formatCurrency(user.monthlyIncomeAvg)}/tháng
            </Badge>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProfileField label="Số CCCD" value={formatCitizenId(user.citizenId)} />
        <ProfileField label="Ngày sinh" value={formatBirthDate(user.dateOfBirth)} />
        <ProfileField label="Giới tính" value={formatGender(user.gender)} />
        <ProfileField label="Số điện thoại" value={user.phone} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Học vấn" value={user.education} />
        <ProfileField label="Nơi làm việc" value={user.workplace} />
        <ProfileField label="Địa chỉ" value={user.address} />
      </dl>
    </div>
  );
}
