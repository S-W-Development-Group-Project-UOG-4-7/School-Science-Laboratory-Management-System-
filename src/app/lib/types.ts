export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';

export interface User {
  name: string;
  role: UserRole;
  email: string;
  id: string;
}
