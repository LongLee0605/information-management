import { Text } from '@/components/atoms/Text';

interface ProfileFieldProps {
  label: string;
  value: string;
}

export function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <Text variant="label">{label}</Text>
      <Text as="dd" variant="body" className="mt-1 font-medium text-slate-900">
        {value}
      </Text>
    </div>
  );
}
