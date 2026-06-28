export type Gender = 'male' | 'female';
export type CustomerTier = 'Diamond' | 'Gold' | 'Silver';
export interface User {
    id: string;
    avatar: string;
    fullName: string;
    citizenId: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    email: string;
    address: string;
    workplace: string;
    maritalStatus: string;
    education: string;
    monthlyIncomeAvg: number;
    tier?: CustomerTier | null;
}
export interface CreateUserInput {
    citizenId: string;
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    address: string;
}
export interface UpdateUserInput {
    citizenId: string;
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    phone: string;
    email: string;
    address: string;
    workplace: string;
    maritalStatus: string;
    education: string;
    monthlyIncomeAvg: number;
}
export interface CreateUserResult {
    user: User;
    cif: string;
}
