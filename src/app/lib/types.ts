export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'deputy-principal' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}