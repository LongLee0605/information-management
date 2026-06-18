import type { User } from '@/types';
import { parseBirthDateFromCitizenId } from '@/utils/avatar';
function parseIsoDate(value: string): {
    year: number;
    month: number;
    day: number;
} | null {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
        return null;
    }
    return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
    };
}
export function formatBirthDate(dateString: string): string {
    const parsed = parseIsoDate(dateString);
    if (!parsed) {
        return dateString;
    }
    const date = new Date(parsed.year, parsed.month - 1, parsed.day);
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}
export function syncBirthDateFromCitizenId(user: User): User {
    const parsed = parseBirthDateFromCitizenId(user.citizenId);
    if (!parsed || parsed === user.dateOfBirth) {
        return user;
    }
    return {
        ...user,
        dateOfBirth: parsed,
    };
}
export function syncUsersBirthDates(users: User[]): User[] {
    return users.map(syncBirthDateFromCitizenId);
}
