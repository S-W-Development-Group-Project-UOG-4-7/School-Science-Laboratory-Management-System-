export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';

export interface User {
  name: string;
  role: UserRole;
  email: string;
  id: string;

   // Two-Factor Authentication fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[];
}
