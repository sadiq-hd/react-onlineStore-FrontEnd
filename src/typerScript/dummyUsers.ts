import { User } from '../types/user';

export const dummyUsers: User[] = [
  {
      id: 1,
      email: 'admin@example.com',
      password: 'admin123',
      name: 'المدير',
      role: 'admin',
      username: 'المدير'
  },
  {
      id: 2,
      email: 'user@example.com',
      password: 'user123',
      name: 'مستخدم',
      role: 'user',
      username: 'مستخدم'
  }
];