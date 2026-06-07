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
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:items-start">
        <Avatar src={user.avatar} alt={user.fullName} size="xl" />
        <div className="flex-1 text-center sm:text-left">
          <Text as="h2" variant="h2">
            {user.fullName}
          </Text>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge>{user.occupation}</Badge>
            <Badge variant="neutral">{user.maritalStatus}</Badge>
          </div>
          <Text variant="caption" className="mt-3">
            Thu nhập trung bình: {formatCurrency(user.monthlyIncomeAvg)}/tháng
          </Text>
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
