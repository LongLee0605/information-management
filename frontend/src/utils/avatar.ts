import type { Gender } from '@/types';
const AVATAR_STYLE = 'avataaars';
function clampDay(year: number, month: number, day: number): number {
    const maxDay = new Date(year, month, 0).getDate();
    return Math.min(Math.max(day, 1), maxDay);
}
function resolveMonth(id: string): number {
    const twoDigit = Number(id.slice(8, 10));
    if (twoDigit >= 1 && twoDigit <= 12) {
        return twoDigit;
    }
    const singleDigit = Number(id[8]);
    if (singleDigit >= 1 && singleDigit <= 12) {
        return singleDigit;
    }
    return (Number(id.slice(9, 12)) % 12) + 1;
}
export function parseBirthDateFromCitizenId(citizenId: string): string | null {
    const id = citizenId.replace(/\D/g, '');
    if (id.length !== 12) {
        return null;
    }
    const centuryCode = Number(id[3]);
    const yy = Number(id.slice(4, 6));
    let day = Number(id.slice(6, 8));
    if (Number.isNaN(centuryCode) || Number.isNaN(yy) || Number.isNaN(day)) {
        return null;
    }
    let century = 1900;
    if (centuryCode === 2 || centuryCode === 3) {
        century = 2000;
    }
    if ((centuryCode === 1 || centuryCode === 3) && day > 40) {
        day -= 40;
    }
    const year = century + yy;
    const month = resolveMonth(id);
    const safeDay = clampDay(year, month, day || 1);
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
    const date = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    if (date.getFullYear() !== year
        || date.getMonth() + 1 !== month
        || date.getDate() !== safeDay) {
        return null;
    }
    return iso;
}
export function buildAvatarSeed(seed: string): string {
    return seed.trim() || 'customer';
}
export function getAvatarUrl(seed: string, gender: Gender = 'male'): string {
    const params = new URLSearchParams({
        seed: buildAvatarSeed(seed),
    });
    if (gender === 'female') {
        params.set('facialHairProbability', '0');
    }
    return `https://api.dicebear.com/7.x/${AVATAR_STYLE}/svg?${params.toString()}`;
}
interface CreateUniqueAvatarInput {
    fullName: string;
    gender: Gender;
    userId: string;
    citizenId: string;
    existingAvatars: Iterable<string>;
}
function toAsciiSeed(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '')
        .trim();
}
export function createUniqueAvatarUrl(input: CreateUniqueAvatarInput): string {
    const used = new Set(input.existingAvatars);
    const nameSeed = toAsciiSeed(input.fullName) || 'Customer';
    const candidates = [
        `${input.userId}-${input.citizenId}`,
        `${nameSeed}-${input.citizenId}`,
        `${input.userId}-${nameSeed}`,
        `${nameSeed}-${input.userId}`,
        `${input.userId}-${input.citizenId}-${Date.now()}`,
    ];
    for (const candidate of candidates) {
        const url = getAvatarUrl(candidate, input.gender);
        if (!used.has(url)) {
            return url;
        }
    }
    for (let attempt = 1; attempt <= 48; attempt += 1) {
        const url = getAvatarUrl(`${input.userId}-${input.citizenId}-v${attempt}`, input.gender);
        if (!used.has(url)) {
            return url;
        }
    }
    return getAvatarUrl(`${input.userId}-${input.citizenId}-${Math.random().toString(36).slice(2, 10)}`, input.gender);
}
