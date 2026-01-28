export type UserRole = 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin';

// Define available privileges in the system
export type Privilege = 
  | 'view_reports'
  | 'manage_equipment'
  | 'manage_bookings'
  | 'manage_users'
  | 'manage_inventory'
  | 'approve_requests'
  | 'view_analytics'
  | 'manage_settings'
  | 'export_data'
  | 'manage_labs';

export interface User {
  name: string;
  role: UserRole;
  email: string;
  id: string;

  // Two-Factor Authentication fields
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  twoFactorBackupCodes?: string[];

  // Custom privileges (favoritism)
  customPrivileges?: Privilege[]; // Additional privileges granted
  revokedPrivileges?: Privilege[]; // Privileges removed from role defaults
}

// Default privileges for each role
export const DEFAULT_ROLE_PRIVILEGES: Record<UserRole, Privilege[]> = {
  'student': [
    'view_reports',
    'manage_bookings'
  ],
  'teacher': [
    'view_reports',
    'manage_bookings',
    'manage_equipment',
    'approve_requests',
    'view_analytics'
  ],
  'lab-assistant': [
    'view_reports',
    'manage_equipment',
    'manage_bookings',
    'manage_inventory',
    'manage_labs'
  ],
  'principal': [
    'view_reports',
    'manage_equipment',
    'manage_bookings',
    'approve_requests',
    'view_analytics',
    'export_data',
    'manage_labs'
  ],
  'admin': [
    'view_reports',
    'manage_equipment',
    'manage_bookings',
    'manage_users',
    'manage_inventory',
    'approve_requests',
    'view_analytics',
    'manage_settings',
    'export_data',
    'manage_labs'
  ]
};

// Get effective privileges for a user (role defaults + custom - revoked)
export function getUserPrivileges(user: User): Privilege[] {
  const rolePrivileges = DEFAULT_ROLE_PRIVILEGES[user.role] || [];
  const customPrivileges = user.customPrivileges || [];
  const revokedPrivileges = user.revokedPrivileges || [];

  // Combine role privileges and custom privileges, then remove revoked ones
  const allPrivileges = [...new Set([...rolePrivileges, ...customPrivileges])];
  return allPrivileges.filter(p => !revokedPrivileges.includes(p));
}

// Check if user has a specific privilege
export function hasPrivilege(user: User, privilege: Privilege): boolean {
  const userPrivileges = getUserPrivileges(user);
  return userPrivileges.includes(privilege);
}

// Privilege metadata for UI display
export const PRIVILEGE_METADATA: Record<Privilege, { label: string; description: string; category: string }> = {
  'view_reports': {
    label: 'View Reports',
    description: 'Access and view system reports',
    category: 'Reports'
  },
  'manage_equipment': {
    label: 'Manage Equipment',
    description: 'Add, edit, and remove equipment',
    category: 'Equipment'
  },
  'manage_bookings': {
    label: 'Manage Bookings',
    description: 'Create and manage lab bookings',
    category: 'Bookings'
  },
  'manage_users': {
    label: 'Manage Users',
    description: 'Create, edit, and delete user accounts',
    category: 'Administration'
  },
  'manage_inventory': {
    label: 'Manage Inventory',
    description: 'Track and manage inventory items',
    category: 'Inventory'
  },
  'approve_requests': {
    label: 'Approve Requests',
    description: 'Approve or reject user requests',
    category: 'Requests'
  },
  'view_analytics': {
    label: 'View Analytics',
    description: 'Access analytics and insights',
    category: 'Analytics'
  },
  'manage_settings': {
    label: 'Manage Settings',
    description: 'Configure system settings',
    category: 'Administration'
  },
  'export_data': {
    label: 'Export Data',
    description: 'Export data to external formats',
    category: 'Data'
  },
  'manage_labs': {
    label: 'Manage Labs',
    description: 'Create and configure laboratory spaces',
    category: 'Labs'
  }
};
export interface InventoryItem {
  id: string;
  name: string;
  category: 'Glassware' | 'Equipment' | 'Chemicals' | 'Safety Materials' | 'Instruments';
  stockLevel: number;
  minStockLevel: number;
  unit: string;
  location: string;
  photo: string;
  storageInstructions: string;
  handlingProcedure: string;
  safetyNotes: string;
  lastUpdated: string;
}