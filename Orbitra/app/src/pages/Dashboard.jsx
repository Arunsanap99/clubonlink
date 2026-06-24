import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  PlusIcon, 
  UserGroupIcon, 
  CogIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userRole, logout, requestAdminRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleRequestAdmin = async () => {
    try {
      await requestAdminRole();
    } catch (error) {
      console.error('Error requesting admin role:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ClubHub
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                )}
              </motion.button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.displayName || currentUser?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {userRole}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to ClubHub
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {userRole === 'user' 
                ? 'Request admin access to start creating clubs'
                : userRole === 'admin'
                ? 'Ready to create and manage your clubs'
                : 'Manage the entire platform and approve admin requests'
              }
            </p>
          </motion.div>

          {/* Role-based Content */}
          {userRole === 'user' && (
            <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <UserGroupIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Become a Club Admin
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Request admin access to create and manage your own clubs. 
                  Once approved, you'll be able to build amazing communities.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestAdmin}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Request Admin Access
                </motion.button>
              </div>
            </motion.div>
          )}

          {userRole === 'admin' && (
            <motion.div variants={itemVariants}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create Club Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/create-club')}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg mb-4">
                    <PlusIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Create New Club
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Start building your community with customizable templates and features.
                  </p>
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Get Started →
                  </div>
                </motion.div>

                {/* Manage Clubs Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  onClick={() => navigate('/manage-clubs')}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
                    <CogIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Manage Clubs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Edit existing clubs, customize branding, and manage settings.
                  </p>
                  <div className="text-green-600 dark:text-green-400 font-medium">
                    View Your Clubs →
                  </div>
                </motion.div>

                {/* Analytics Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
                    <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Club Analytics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    View insights and analytics for all your clubs and members.
                  </p>
                  <div className="text-purple-600 dark:text-purple-400 font-medium">
                    Coming in Step 6 →
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {userRole === 'superadmin' && (
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Superadmin Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Access the admin request management system to approve or reject admin requests.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/admin-requests')}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Admin Requests
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/superadmin/review')}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Club Reviews
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/publish-requests')}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Published Clubs
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          {/* Info Section */}
          <motion.div variants={itemVariants} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🚀 Platform Development Progress
            </h3>
            <div className="space-y-2 text-blue-800 dark:text-blue-200">
              <p>✅ Step 1: Authentication & Role System</p>
              <p>✅ Step 2: Club Creation & Template Selection</p>
              <p>✅ Step 3: Club Customization & Branding</p>
              <p>✅ Step 4: Club Publishing & Unique Links (Current)</p>
              <p>⏳ Step 5: Member Management System</p>
              <p>⏳ Step 6: Core Club Features</p>
              <p>⏳ Step 7: Advanced Features & Analytics</p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
