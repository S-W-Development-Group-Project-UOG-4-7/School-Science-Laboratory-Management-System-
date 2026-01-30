'use client';

import { useState } from "react";
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
import { Avatar, AvatarFallback } from "./ui/avatar";
import { PracticalsPage } from "./PracticalsPage";
import { InventoryPage } from "./InventoryPage";
import { SchedulePage } from "./SchedulePage";
import { SettingsPage } from "./SettingsPage";
import { UserManagementPage } from "./UserManagementPage";
import { HomePage } from "./HomePage";
import type { AuthUser } from "@/lib/types";


interface DashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

type Page =
  | "home"
  | "practicals"
  | "inventory"
  | "schedule"
  | "settings"
  | "users";

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] =
    useState<Page>("home");

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseNavigation = [
      {
        id: "practicals" as Page,
        label: "Practical vedios",
        icon: Video,
        roles: ['student', 'teacher', 'lab-assistant', 'principal', 'admin'],
      },
      {
        id: "inventory" as Page,
        label: "Laboratory Management",
        icon: Package,
        roles: ['teacher', 'lab-assistant', 'principal', 'admin'],
      },
      {
        id: "schedule" as Page,
        label: "Schedule",
        icon: Calendar,
        roles: ['student', 'teacher', 'lab-assistant', 'principal', 'admin'],
      },
      {
        id: "users" as Page,
        label: "User Management",
        icon: UsersIcon,
        roles: ['admin'],
      },
    ];

    return baseNavigation.filter(item => item.roles.includes(user.role));
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
              onClick={() => setCurrentPage("home")}
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
                  onClick={() => setCurrentPage(item.id)}
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
                        onClick={() => setCurrentPage(item.id)}
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
                      <AvatarFallback className={`bg-gradient-to-br ${getRoleBadgeColor()} text-white text-sm`}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm text-white">{user.name}</p>
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
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {getRoleDisplayName(user.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setCurrentPage("settings")}
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
                userName={user.name}
                userRole={user.role} 
                onNavigate={(page) => setCurrentPage(page as Page)}
              />
            )}
            {currentPage === "practicals" && (
              <PracticalsPage userRole={user.role} />
            )}
            {currentPage === "inventory" && (
              <InventoryPage userRole={user.role} />
            )}
            {currentPage === "schedule" && (
              <SchedulePage userRole={user.role} />
            )}
            {currentPage === "users" && user.role === "admin" && (
              <UserManagementPage />
            )}
            {currentPage === "settings" && (
              <SettingsPage user={user} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}