import usersData from '@/data/users.json';
import type { User } from '@/types';
import { MOCK_DELAY_MS } from '@/constants';
import { delay } from '@/utils';

const users = usersData as User[];

export async function getUsers(): Promise<User[]> {
  await delay(MOCK_DELAY_MS);
  return [...users];
}

export async function getUserById(id: string): Promise<User | null> {
  await delay(MOCK_DELAY_MS);
  return users.find((user) => user.id === id) ?? null;
}
