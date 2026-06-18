export type Gender = 'male' | 'female';
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
}
export interface CreateUserInput {
    citizenId: string;
    fullName: string;
    dateOfBirth: string;
    gender: Gender;
    address: string;
}
export interface CreateUserResult {
    user: User;
    cif: string;
}
