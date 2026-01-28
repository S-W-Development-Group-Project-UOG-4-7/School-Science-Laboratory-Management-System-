'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Trash2, 
  Edit, 
  Search,
  MoreVertical,
  Mail,
  Key
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'lab-assistant' | 'principal' | 'admin' | 'deputy-principal';
  status: 'active' | 'inactive';
  createdDate: string;
  lastLogin?: string;
}

const mockUsers: SystemUser[] = [
  { id: 'admin-001', name: 'System Administrator', email: 'admin@school.lk', role: 'admin', status: 'active', createdDate: '2024-01-01', lastLogin: '2025-11-27' },
  { id: 'principal-001', name: 'Principal Silva', email: 'principal@school.lk', role: 'principal', status: 'active', createdDate: '2024-01-01', lastLogin: '2025-11-26' },
  { id: 'teacher-001', name: 'Mr. Perera', email: 'teacher1@school.lk', role: 'teacher', status: 'active', createdDate: '2024-02-15', lastLogin: '2025-11-27' },
  { id: 'teacher-002', name: 'Mrs. Fernando', email: 'teacher2@school.lk', role: 'teacher', status: 'active', createdDate: '2024-02-15', lastLogin: '2025-11-25' },
  { id: 'lab-001', name: 'Lab Assistant Kumar', email: 'labassist1@school.lk', role: 'lab-assistant', status: 'active', createdDate: '2024-03-01', lastLogin: '2025-11-27' },
  { id: 'lab-002', name: 'Lab Assistant Nimal', email: 'labassist2@school.lk', role: 'lab-assistant', status: 'active', createdDate: '2024-03-01', lastLogin: '2025-11-26' },
  { id: 'student-001', name: 'Student Amal', email: 'student1@school.lk', role: 'student', status: 'active', createdDate: '2024-04-01', lastLogin: '2025-11-27' },
  { id: 'student-002', name: 'Student Sahan', email: 'student2@school.lk', role: 'student', status: 'active', createdDate: '2024-04-01', lastLogin: '2025-11-27' },
  { id: 'student-003', name: 'Student Nethmi', email: 'student3@school.lk', role: 'student', status: 'active', createdDate: '2024-04-05', lastLogin: '2025-11-26' },
  { id: 'student-004', name: 'Student Kasun', email: 'student4@school.lk', role: 'student', status: 'inactive', createdDate: '2024-04-10' },
  { id: 'deputy-001', name: 'Deputy Principal Wijesinghe', email: 'deputyprincipal@school.lk', role: 'deputy-principal', status: 'active', createdDate: '2024-04-15' },
];

export function UserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as SystemUser['role'],
    password: '',
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'principal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deputy-principal':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'teacher':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lab-assistant':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleAddUser = () => {
    const user: SystemUser = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setUsers([user, ...users]);
    setIsAddDialogOpen(false);
    setNewUser({ name: '', email: '', role: 'student', password: '' });
    
    toast.success('User Added Successfully', {
      description: `${user.name} has been added to the system.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && (user.role === 'admin' || user.role === 'principal')) {
      toast.error('Cannot Delete User', {
        description: 'Admin and Principal accounts cannot be deleted.',
      });
      return;
    }

    setUsers(users.filter(u => u.id !== userId));
    toast.success('User Deleted', {
      description: 'User has been removed from the system.',
    });
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
        : u
    ));
    
    const user = users.find(u => u.id === userId);
    toast.success('Status Updated', {
      description: `${user?.name}'s status has been changed.`,
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    students: users.filter(u => u.role === 'student').length,
    staff: users.filter(u => u.role !== 'student').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-blue-900 mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@school.lk"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as SystemUser['role'] })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="lab-assistant">Lab Assistant</option>
                  <option value="principal">Principal</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter initial password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <p className="text-xs text-gray-500">User will be prompted to change on first login</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.password}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl text-blue-700">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl text-green-700">{stats.active}</p>
                </div>
                <Shield className="w-10 h-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Students</p>
                  <p className="text-3xl text-yellow-700">{stats.students}</p>
                </div>
                <Users className="w-10 h-10 text-yellow-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Staff</p>
                  <p className="text-3xl text-purple-700">{stats.staff}</p>
                </div>
                <Shield className="w-10 h-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)} variant="outline">
                          {user.role === 'lab-assistant'
                            ? 'Lab Assistant'
                            : user.role === 'deputy-principal'
                            ? 'Deputy Principal'
                            : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.status)} variant="outline">
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {user.lastLogin || 'Never'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                              <Shield className="w-4 h-4 mr-2" />
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            {user.role !== 'admin' && user.role !== 'principal' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}