import { Text } from '@/components/atoms/Text';

interface ProfileFieldProps {
  label: string;
  value: string;
}

export function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 transition-all">
      <Text variant="label">{label}</Text>
      <Text as="dd" variant="body" className="mt-2 font-medium text-foreground">
        {value}
      </Text>
    </div>
  );
}
