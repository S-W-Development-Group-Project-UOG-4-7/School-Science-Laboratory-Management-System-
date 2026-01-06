'use client';

import { useState, useEffect, useRef } from 'react';
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
  Key,
  Loader2,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from './ui/alert';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdDate: string;
  lastLogin?: string | null;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editUser, setEditUser] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchUsers(searchQuery);
      } else {
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      const url = search 
        ? `/api/users?search=${encodeURIComponent(search)}`
        : '/api/users';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      const user = await response.json();
      setUsers([user, ...users]);
      setIsAddDialogOpen(false);
      setNewUser({ name: '', email: '', role: 'student', password: '' });
      
      toast.success('User Added Successfully', {
        description: `${user.name} has been added to the system.`,
      });
    } catch (error: any) {
      toast.error('Failed to add user', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/users?id=${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success('User Deleted', {
        description: `${selectedUser.name} has been removed from the system.`,
      });
    } catch (error: any) {
      toast.error('Failed to delete user', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      
      toast.success('Status Updated', {
        description: `${user.name}'s status has been changed.`,
      });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      toast.success('Password Reset Successfully', {
        description: `Password for ${selectedUser.name} has been reset.`,
      });
      
      setIsResetPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editUser.name || !editUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsEditDialogOpen(false);
      setEditUser({ id: '', name: '', email: '', role: '' });
      
      toast.success('User Updated Successfully', {
        description: `${updatedUser.name}'s information has been updated.`,
      });
    } catch (error: any) {
      toast.error('Failed to update user', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Name: 'John Doe', Email: 'john.doe@school.lk', Role: 'student', Password: 'TempPass123' },
      { Name: 'Jane Smith', Email: 'jane.smith@school.lk', Role: 'teacher', Password: 'TempPass456' },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Add column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    XLSX.writeFile(wb, 'user_import_template.xlsx');
    toast.success('Template Downloaded', {
      description: 'Fill in the template and upload to import users.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Invalid file type', {
          description: 'Please upload an Excel file (.xlsx or .xls)',
        });
        return;
      }
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImportUsers = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setSubmitting(true);
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('Empty file', {
          description: 'The Excel file contains no data.',
        });
        return;
      }

      // Validate and prepare data
      const usersToImport = jsonData.map((row: any, index) => ({
        name: row.Name || row.name,
        email: row.Email || row.email,
        role: (row.Role || row.role || 'student').toLowerCase(),
        password: row.Password || row.password,
        rowNumber: index + 2, // +2 for header and 0-indexing
      }));

      // Send to backend
      const response = await fetch('/api/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: usersToImport }),
      });

      if (!response.ok) {
        throw new Error('Failed to import users');
      }

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.success > 0) {
        fetchUsers(); // Refresh user list
        toast.success('Import Completed', {
          description: `${result.success} user(s) imported successfully.`,
        });
      }

      if (result.failed > 0) {
        toast.warning('Some imports failed', {
          description: `${result.failed} user(s) could not be imported. Check details below.`,
        });
      }
    } catch (error: any) {
      toast.error('Import failed', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRINCIPAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TEACHER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LAB_ASSISTANT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'ACTIVE' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').split(' ').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    students: users.filter(u => u.role === 'STUDENT').length,
    staff: users.filter(u => u.role !== 'STUDENT').length,
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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Upload className="w-4 h-4 mr-2" />
                Import Users
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Import Users from Excel</DialogTitle>
                <DialogDescription>
                  Upload an Excel file to bulk import users into the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertTitle>Template Format</AlertTitle>
                  <AlertDescription>
                    Your Excel file should have columns: Name, Email, Role, Password
                    <br />
                    Valid roles: student, teacher, lab-assistant, principal, admin
                  </AlertDescription>
                </Alert>

                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="excel-file">Upload Excel File</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {importFile && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {importFile.name}
                    </p>
                  )}
                </div>

                {importResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">{importResult.success} Successful</span>
                      </div>
                      {importResult.failed > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="font-semibold">{importResult.failed} Failed</span>
                        </div>
                      )}
                    </div>

                    {importResult.errors.length > 0 && (
                      <div className="mt-4 max-h-48 overflow-y-auto border rounded-md p-3 bg-red-50">
                        <h4 className="font-semibold text-red-800 mb-2">Import Errors:</h4>
                        <ul className="space-y-1 text-sm">
                          {importResult.errors.map((err, idx) => (
                            <li key={idx} className="text-red-700">
                              Row {err.row} ({err.email}): {err.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportFile(null);
                  setImportResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}>
                  Close
                </Button>
                <Button 
                  onClick={handleImportUsers}
                  disabled={!importFile || submitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Users
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
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
                  disabled={!newUser.name || !newUser.email || !newUser.password || submitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                  <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
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
                  <p className="text-3xl font-bold text-green-700">{stats.active}</p>
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
                  <p className="text-3xl font-bold text-yellow-700">{stats.students}</p>
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
                  <p className="text-3xl font-bold text-purple-700">{stats.staff}</p>
                </div>
                <Shield className="w-10 h-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
              {loading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
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
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.name.charAt(0)}
                              </div>
                              <span className="font-medium">{user.name}</span>
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
                              {formatRole(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(user.status)} variant="outline">
                              {formatRole(user.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
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
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setEditUser({
                                      id: user.id,
                                      name: user.name,
                                      email: user.email,
                                      role: user.role.toLowerCase().replace('_', '-'),
                                    });
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsResetPasswordDialogOpen(true);
                                  }}
                                >
                                  <Key className="w-4 h-4 mr-2" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this user?
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {formatRole(selectedUser.role)}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsResetPasswordDialogOpen(false);
              setNewPassword('');
              setSelectedUser(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={!newPassword || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter full name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="user@school.lk"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="lab-assistant">Lab Assistant</option>
                <option value="principal">Principal</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditUser({ id: '', name: '', email: '', role: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser}
              disabled={!editUser.name || !editUser.email || submitting}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}