import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  SpeakerWaveIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const ClubPortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const {
    club,
    clubSlug,
    userMembership,
    isMember,
    isAdmin,
    loading,
    error,
    getMemberRoleDisplay
  } = useClubPortal();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items based on club features and user permissions
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: `/clubs/${clubSlug}`,
        icon: HomeIcon,
        current: location.pathname === `/clubs/${clubSlug}`
      }
    ];

    if (!isMember) return baseItems;

    const memberItems = [];

    // Add navigation items based on club features
    if (club?.features?.includes('members')) {
      memberItems.push({
        name: 'Members',
        href: `/clubs/${clubSlug}/members`,
        icon: UserGroupIcon,
        current: location.pathname.includes('/members')
      });
    }

    if (club?.features?.includes('events')) {
      memberItems.push({
        name: 'Events',
        href: `/clubs/${clubSlug}/events`,
        icon: CalendarIcon,
        current: location.pathname.includes('/events')
      });
    }

    if (club?.features?.includes('announcements')) {
      memberItems.push({
        name: 'Announcements',
        href: `/clubs/${clubSlug}/announcements`,
        icon: SpeakerWaveIcon,
        current: location.pathname.includes('/announcements')
      });
    }

    if (club?.features?.includes('attendance')) {
      memberItems.push({
        name: 'Attendance',
        href: `/clubs/${clubSlug}/attendance`,
        icon: ClipboardDocumentCheckIcon,
        current: location.pathname.includes('/attendance')
      });
    }

    // Add admin section if user is admin
    if (isAdmin) {
      memberItems.push({
        name: 'Admin Panel',
        href: `/clubs/${clubSlug}/admin`,
        icon: CogIcon,
        current: location.pathname.includes('/admin'),
        adminOnly: true
      });
    }

    return [...baseItems, ...memberItems];
  };

  const navigationItems = getNavigationItems();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading club portal...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Club Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || 'The club you\'re looking for doesn\'t exist or isn\'t published yet.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Access denied for non-members
  if (!isMember && location.pathname !== `/clubs/${clubSlug}`) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <KeyIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Member Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be a member of {club.clubName} to access this page.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/clubs/${clubSlug}`)}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              View Club Info
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex flex-col h-full">
          {/* Club Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {club.logoUrl ? (
                <img 
                  src={club.logoUrl} 
                  alt={`${club.clubName} logo`}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: club.themeColor || '#6366f1' }}
                >
                  {club.clubName?.charAt(0) || 'C'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {club.clubName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {club.tagline}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* User Membership Info */}
          {userMembership && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentUser?.displayName || currentUser?.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMemberRoleDisplay(userMembership.role).color}`}>
                      {getMemberRoleDisplay(userMembership.role).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${item.adminOnly ? 'border-t border-gray-200 dark:border-gray-700 mt-4 pt-4' : ''}`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {club.clubName}
              </h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClubPortalLayout;
