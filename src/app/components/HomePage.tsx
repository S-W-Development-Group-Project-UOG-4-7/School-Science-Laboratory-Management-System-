'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  FlaskConical,
  Users,
  Calendar,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import type { UserRole } from '@/lib/types';
import { ViewNotes } from './student/ViewNotes';

import { ViewQuizzes } from './student/ViewQuizzes';
import { ViewQuizAttempts } from './student/ViewQuizAttempts';

interface HomePageProps {
  userName: string;
  userRole: UserRole;
  userId: number;
  onNavigate: (page: string) => void;
}

export function HomePage({ userName, userRole, userId, onNavigate }: HomePageProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleWelcome = () => {
    switch (userRole) {
      case 'admin':
        return 'You have full system administration access';
      case 'principal':
        return 'Welcome to your administrative dashboard';
      case 'teacher':
        return 'Ready to inspire young scientists today';
      case 'lab-assistant':
        return 'Laboratory management dashboard';
      case 'student':
        return 'Explore and learn with science';
      default:
        return 'Welcome to the Science Lab Portal';
    }
  };

  // Mock statistics based on role
  const getStats = () => {
    switch (userRole) {
      case 'admin':
        return [
          { label: 'Total Users', value: '142', icon: Users, color: 'blue', page: 'users' },
          { label: 'Active Sessions', value: '23', icon: TrendingUp, color: 'green', page: 'schedule' },
          { label: 'System Health', value: '98%', icon: CheckCircle, color: 'green', page: 'settings' },
          { label: 'Pending Tasks', value: '5', icon: Clock, color: 'yellow', page: 'requests' },
        ];
      case 'principal':
        return [
          { label: 'Pending Requests', value: '8', icon: Clock, color: 'yellow', page: 'requests' },
          { label: 'Active Teachers', value: '12', icon: Users, color: 'green', page: 'users' },
          { label: 'Lab Sessions Today', value: '6', icon: FlaskConical, color: 'blue', page: 'schedule' },
          { label: 'Inventory Items', value: '234', icon: Package, color: 'purple', page: 'inventory' },
        ];
      case 'teacher':
      case 'lab-assistant':
        return [
          { label: 'My Practicals', value: '8', icon: FlaskConical, color: 'blue', page: 'practicals' },
          { label: 'Scheduled Sessions', value: '4', icon: Calendar, color: 'green', page: 'schedule' },
          { label: 'Pending Requests', value: '2', icon: Clock, color: 'yellow', page: 'requests' },
          { label: 'Inventory Items', value: '234', icon: Package, color: 'purple', page: 'inventory' },
        ];
      case 'student':
        return [
          { label: 'Available Practicals', value: '12', icon: FlaskConical, color: 'blue', page: 'practicals' },
          { label: 'Completed', value: '8', icon: CheckCircle, color: 'green', page: 'practicals' },
          { label: 'Upcoming Sessions', value: '3', icon: Calendar, color: 'yellow', page: 'schedule' },
          { label: 'Video Lessons', value: '24', icon: TrendingUp, color: 'purple', page: 'practicals' },
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    switch (userRole) {
      case 'admin':
        return [
          { label: 'Manage Users', page: 'users', icon: Users },
          { label: 'View Inventory', page: 'inventory', icon: Package },
          { label: 'System Settings', page: 'settings', icon: AlertCircle },
        ];
      case 'principal':
        return [
          { label: 'Review Requests', page: 'requests', icon: Clock },
          { label: 'View Schedule', page: 'schedule', icon: Calendar },
          { label: 'Inventory Overview', page: 'inventory', icon: Package },
        ];
      case 'teacher':
      case 'lab-assistant':
        return [
          { label: 'Create Request', page: 'requests', icon: Package },
          { label: 'Schedule Practical', page: 'schedule', icon: Calendar },
          { label: 'Manage Inventory', page: 'inventory', icon: FlaskConical },
        ];
      case 'student':
        return [
          { label: 'Browse Practicals', page: 'practicals', icon: FlaskConical },
          { label: 'View Schedule', page: 'schedule', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const stats = getStats();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
          <motion.h1
            className="text-white mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {getGreeting()}, {userName}!
          </motion.h1>
          <motion.p
            className="text-blue-100 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {getRoleWelcome()}
          </motion.p>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`${getColorClass(stat.color)} border-2 cursor-pointer transition-all hover:shadow-lg`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (stat.page) {
                  onNavigate(stat.page);
                }
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="w-10 h-10 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNavigate(action.page);
                    }}
                  >
                    <action.icon className="w-5 h-5 text-blue-600" />
                    <span>{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Student Features Section */}
      {userRole === 'student' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Student Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => onNavigate('notes')}
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>View Notes</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => onNavigate('quizzes')}
                >
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  <span>Available Quizzes</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => onNavigate('quiz-attempts')}
                >
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Quiz Scores</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity or Announcements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">
              {userRole === 'student' ? 'Upcoming Sessions' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRole === 'student' ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">Chemistry Practical: Titration</p>
                      <p className="text-xs text-gray-600">Tomorrow, 10:00 AM - Lab A</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">Biology Practical: Microscopy</p>
                      <p className="text-xs text-gray-600">Friday, 2:00 PM - Lab B</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">Practical video uploaded successfully</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">Inventory request pending approval</p>
                      <p className="text-xs text-gray-600">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">Lab session completed</p>
                      <p className="text-xs text-gray-600">Yesterday</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}