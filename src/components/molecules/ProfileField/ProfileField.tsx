import { Text } from '@/components/atoms/Text';

interface ProfileFieldProps {
  label: string;
  value: string;
}

export function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="border-b border-border pb-3 last:border-b-0">
      <Text variant="label">{label}</Text>
      <Text as="dd" variant="body" className="mt-1 font-medium text-foreground">
        {value}
      </Text>
    </div>
  );
}
