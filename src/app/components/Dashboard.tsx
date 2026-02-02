'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  FlaskConical,
  Video,
  Package,
  Calendar,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
  FileText,
  Users as UsersIcon,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PracticalsPage } from "./PracticalsPage";
import { InventoryPage } from "./InventoryPage";
import { SchedulePage } from "./SchedulePage";
import { SettingsPage } from "./SettingsPage";
import { InventoryRequestsPage } from "./InventoryRequestsPage";
import { UserManagementPage } from "./UserManagementPage";
import { HomePage } from "./HomePage";
import type { User } from "@/src/app/lib/types";

interface DashboardProps {
  user: User;
  onLogout: () => void;
  initialView?: string;
}

type Page =
  | "home"
  | "practicals"
  | "inventory"
  | "schedule"
  | "settings"
  | "requests"
  | "users";

// Default privileges for each role
const DEFAULT_ROLE_PRIVILEGES: Record<string, string[]> = {
  'STUDENT': ['view_reports', 'manage_bookings'],
  'TEACHER': ['view_reports', 'manage_bookings', 'manage_equipment', 'approve_requests', 'view_analytics'],
  'LAB_ASSISTANT': ['view_reports', 'manage_equipment', 'manage_bookings', 'manage_inventory', 'manage_labs'],
  'PRINCIPAL': ['view_reports', 'manage_equipment', 'manage_bookings', 'approve_requests', 'view_analytics', 'export_data', 'manage_labs'],
  'ADMIN': ['view_reports', 'manage_equipment', 'manage_bookings', 'manage_users', 'manage_inventory', 'approve_requests', 'view_analytics', 'manage_settings', 'export_data', 'manage_labs']
};

export function Dashboard({ user, onLogout, initialView }: DashboardProps) {
  const router = useRouter();
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [userName, setUserName] = useState<string>(user.name);
  const [userEmail, setUserEmail] = useState<string>(user.email);
  const [userPhone, setUserPhone] = useState<string>(user.phone || '');
  const [userPrivileges, setUserPrivileges] = useState<string[]>([]);
  
  // Initialize currentPage from initialView (URL) or localStorage
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // First priority: URL parameter
    if (initialView && isValidPage(initialView)) {
      return initialView as Page;
    }
    
    // Second priority: localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-view');
      if (saved && isValidPage(saved)) {
        return saved as Page;
      }
    }
    
    // Default: home
    return "home";
  });

  // Helper function to validate page names
  function isValidPage(page: string): boolean {
    const validPages: Page[] = ["home", "practicals", "inventory", "schedule", "settings", "requests", "users"];
    return validPages.includes(page as Page);
  }

  // Helper function to check if user has a specific privilege
  const hasPrivilege = (privilegeId: string): boolean => {
    return userPrivileges.includes(privilegeId);
  };

  // Calculate effective privileges (role + custom - revoked)
  const calculateEffectivePrivileges = (
    role: string,
    customPrivileges: string[] = [],
    revokedPrivileges: string[] = []
  ): string[] => {
    const roleUpperCase = role.toUpperCase().replace('-', '_');
    const rolePrivileges = DEFAULT_ROLE_PRIVILEGES[roleUpperCase] || [];
    
    // Start with role privileges, remove revoked ones
    const effectiveFromRole = rolePrivileges.filter(p => !revokedPrivileges.includes(p));
    
    // Add custom privileges that aren't from role
    const effectiveCustom = customPrivileges.filter(p => !rolePrivileges.includes(p));
    
    // Combine both
    return [...effectiveFromRole, ...effectiveCustom];
  };

  // Handle page changes - save to both localStorage and URL
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    
    // Save to localStorage
    localStorage.setItem('dashboard-view', page);
    
    // Update URL without page reload
    router.push(`/?view=${page}`, { scroll: false });
  };

  // Fetch user's complete profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch from database
        const dbResponse = await fetch(`/api/users?search=${encodeURIComponent(user.email)}`);
        if (dbResponse.ok) {
          const users = await dbResponse.json();
          const dbUser = users.find((u: any) => u.email === user.email);
          
          if (dbUser) {
            // Update name from database
            setUserName(dbUser.name);
            setUserEmail(dbUser.email);
            setUserPhone(dbUser.phone || '');
            
            // Calculate effective privileges
            const privileges = calculateEffectivePrivileges(
              dbUser.role,
              dbUser.customPrivileges || [],
              dbUser.revokedPrivileges || []
            );
            setUserPrivileges(privileges);
          }
        }

        // Fetch profile image from JSON file
        const profileResponse = await fetch(`/api/users/profile?userId=${encodeURIComponent(user.email)}`);
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          if (data.user.profileImageUrl) {
            setProfileImageUrl(data.user.profileImageUrl);
          }
          // Also update name from profile if available
          if (data.user.name) {
            setUserName(data.user.name);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user.email]);

  // Listen for profile updates from SettingsPage
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('Profile update event received:', event.detail);
      
      // Update profile image
      if (event.detail?.profileImageUrl) {
        setProfileImageUrl(event.detail.profileImageUrl);
      }
      
      // Update user name
      if (event.detail?.name) {
        setUserName(event.detail.name);
      }
      
      // Update email
      if (event.detail?.email) {
        setUserEmail(event.detail.email);
      }
      
      // Update phone
      if (event.detail?.phone !== undefined) {
        setUserPhone(event.detail.phone);
      }
    };

    window.addEventListener('profileUpdated' as any, handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate);
    };
  }, []);

  // Define navigation items based on user privileges
  const getNavigationItems = () => {
    const navigationConfig = [
      {
        id: "practicals" as Page,
        label: "Practicals & Videos",
        icon: Video,
        requiredPrivilege: 'view_reports', // Anyone who can view reports can access practicals
      },
      {
        id: "inventory" as Page,
        label: "Laboratory Inventory",
        icon: Package,
        requiredPrivilege: 'manage_inventory',
      },
      {
        id: "schedule" as Page,
        label: "Schedule & Calendar",
        icon: Calendar,
        requiredPrivilege: 'manage_bookings',
      },
      {
        id: "requests" as Page,
        label: "Inventory Requests",
        icon: FileText,
        requiredPrivilege: 'approve_requests',
      },
      {
        id: "users" as Page,
        label: "User Management",
        icon: UsersIcon,
        requiredPrivilege: 'manage_users',
      },
    ];

    // Filter navigation items based on user's privileges
    return navigationConfig.filter(item => hasPrivilege(item.requiredPrivilege));
  };

  const navigation = getNavigationItems();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'lab-assistant':
        return 'Lab Assistant';
      case 'principal':
        return 'Principal';
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Teacher';
      case 'student':
        return 'Student';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin':
        return 'from-purple-500 to-purple-600';
      case 'principal':
        return 'from-blue-500 to-blue-600';
      case 'teacher':
        return 'from-green-500 to-green-600';
      case 'lab-assistant':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-yellow-50/30">
      {/* Header */}
      <motion.header
        className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 shadow-lg sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => handlePageChange("home")}
            >
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white">Science Lab Portal</h1>
              </div>
            </motion.div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    currentPage === item.id
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* Mobile Navigation Dropdown */}
              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      Menu
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {navigation.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handlePageChange(item.id)}
                        className={
                          currentPage === item.id ? "bg-blue-50" : ""
                        }
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-white hover:bg-white/10"
                  >
                    <Avatar className="w-8 h-8 border-2 border-white/30">
                      {profileImageUrl ? (
                        <AvatarImage src={profileImageUrl} alt={userName} />
                      ) : null}
                      <AvatarFallback className={`bg-gradient-to-br ${getRoleBadgeColor()} text-white text-sm`}>
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm text-white">{userName}</p>
                      <p className="text-xs text-white/70">
                        {getRoleDisplayName(user.role)}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="text-sm">{userName}</p>
                      <p className="text-xs text-gray-500">
                        {getRoleDisplayName(user.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handlePageChange("settings")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPage === "home" && (
              <HomePage 
                userName={userName}
                userRole={user.role} 
                onNavigate={(page) => handlePageChange(page as Page)}
              />
            )}
            {currentPage === "practicals" && hasPrivilege('view_reports') && (
              <PracticalsPage userRole={user.role} />
            )}
            {currentPage === "inventory" && hasPrivilege('manage_inventory') && (
              <InventoryPage userRole={user.role} />
            )}
            {currentPage === "schedule" && hasPrivilege('manage_bookings') && (
              <SchedulePage userRole={user.role} />
            )}
            {currentPage === "requests" && hasPrivilege('approve_requests') && (
              <InventoryRequestsPage 
                userRole={user.role}
                userId={user.id}
                userName={userName}
              />
            )}
            {currentPage === "users" && hasPrivilege('manage_users') && (
              <UserManagementPage />
            )}
            {currentPage === "settings" && (
              <SettingsPage 
                user={{
                  ...user,
                  name: userName,
                  email: userEmail,
                  phone: userPhone,
                }}
              />
            )}
            {/* Access Denied Message */}
            {!hasPrivilege('view_reports') && currentPage === "practicals" && (
              <div className="text-center py-12">
                <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to access this page.</p>
              </div>
            )}
            {!hasPrivilege('manage_inventory') && currentPage === "inventory" && (
              <div className="text-center py-12">
                <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to access this page.</p>
              </div>
            )}
            {!hasPrivilege('manage_bookings') && currentPage === "schedule" && (
              <div className="text-center py-12">
                <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to access this page.</p>
              </div>
            )}
            {!hasPrivilege('approve_requests') && currentPage === "requests" && (
              <div className="text-center py-12">
                <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to access this page.</p>
              </div>
            )}
            {!hasPrivilege('manage_users') && currentPage === "users" && (
              <div className="text-center py-12">
                <ShieldCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to access this page.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}