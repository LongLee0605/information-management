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
  occupation: string;
  workplace: string;
  maritalStatus: string;
  education: string;
  monthlyIncomeAvg: number;
}
