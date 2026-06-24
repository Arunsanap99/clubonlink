import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { 
  UserGroupIcon,
  CalendarIcon,
  SpeakerWaveIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  EyeIcon,
  KeyIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const ClubDashboard = () => {
  const navigate = useNavigate();
  const {
    club,
    clubSlug,
    isMember,
    isAdmin,
    userMembership,
    clubMembers,
    clubEvents,
    clubAnnouncements,
    getClubStats,
    formatDate,
    getMemberRoleDisplay
  } = useClubPortal();

  const stats = getClubStats();

  // Feature cards for non-members (public view)
  const renderPublicView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Club Header */}
      <div className="text-center mb-12">
        {club.logoUrl ? (
          <img 
            src={club.logoUrl} 
            alt={`${club.clubName} logo`}
            className="w-24 h-24 mx-auto rounded-full object-cover mb-6"
          />
        ) : (
          <div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6"
            style={{ backgroundColor: club.themeColor || '#6366f1' }}
          >
            {club.clubName?.charAt(0) || 'C'}
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {club.clubName}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {club.tagline}
        </p>
        
        {/* Club Type and Template */}
        <div className="flex justify-center space-x-4 mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            {club.clubType}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
            {club.template} Template
          </span>
        </div>

        {/* Join Club CTA */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
          <KeyIcon className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Join {club.clubName}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Get an access key from a club admin to join and access all features.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Access keys will be available in Step 5 of the platform development.
          </p>
        </div>
      </div>

      {/* Banner */}
      {club.bannerUrl && (
        <div className="rounded-xl overflow-hidden shadow-lg mb-12">
          <img 
            src={club.bannerUrl} 
            alt="Club banner" 
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Features Overview */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          What We Offer
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {club.features?.map((featureId) => {
            const featureConfig = {
              members: { icon: UserGroupIcon, name: 'Members', description: 'Connect with fellow members' },
              events: { icon: CalendarIcon, name: 'Events', description: 'Join exciting club events' },
              announcements: { icon: SpeakerWaveIcon, name: 'Announcements', description: 'Stay updated with latest news' },
              attendance: { icon: ClipboardDocumentCheckIcon, name: 'Attendance', description: 'Track your participation' }
            };
            
            const config = featureConfig[featureId];
            if (!config) return null;

            return (
              <div key={featureId} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <config.icon 
                  className="w-8 h-8 mb-4" 
                  style={{ color: club.themeColor }}
                />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {config.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Links */}
      {club.socialLinks && Object.values(club.socialLinks).some(url => url.trim()) && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Connect With Us
          </h2>
          <div className="flex justify-center flex-wrap gap-4">
            {Object.entries(club.socialLinks).map(([platform, url]) => {
              if (!url.trim()) return null;
              
              const platformConfig = {
                discord: { name: 'Discord', icon: '💬', color: 'bg-indigo-500' },
                instagram: { name: 'Instagram', icon: '📸', color: 'bg-pink-500' },
                website: { name: 'Website', icon: '🌐', color: 'bg-blue-500' },
                twitter: { name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
                linkedin: { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
                youtube: { name: 'YouTube', icon: '📺', color: 'bg-red-500' }
              };
              
              const config = platformConfig[platform];
              if (!config) return null;

              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-2 px-6 py-3 ${config.color} text-white rounded-lg hover:opacity-90 transition-opacity shadow-md`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="font-medium">{config.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Member dashboard view
  const renderMemberView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back to {club.clubName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening in your club.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalMembers}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upcoming Events
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.upcomingEvents}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SpeakerWaveIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Recent Announcements
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.recentAnnouncements}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: club.themeColor }}
              >
                {getMemberRoleDisplay(userMembership.role).label.charAt(0)}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Your Role
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {getMemberRoleDisplay(userMembership.role).label}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {clubAnnouncements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <SpeakerWaveIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {announcement.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {clubAnnouncements.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent announcements
              </p>
            )}
          </div>
          {club.features?.includes('announcements') && (
            <button
              onClick={() => navigate(`/clubs/${clubSlug}/announcements`)}
              className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              View All Announcements
            </button>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {clubEvents
              .filter(event => new Date(event.eventDate) > new Date())
              .slice(0, 3)
              .map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.eventDate)}
                    </p>
                  </div>
                </div>
              ))}
            {stats.upcomingEvents === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No upcoming events
              </p>
            )}
          </div>
          {club.features?.includes('events') && (
            <button
              onClick={() => navigate(`/clubs/${clubSlug}/events`)}
              className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              View All Events
            </button>
          )}
        </div>
      </div>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admin Actions
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/clubs/${clubSlug}/admin`)}
              className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <CogIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Club Settings
              </span>
            </button>
            
            {club.features?.includes('members') && (
              <button
                onClick={() => navigate(`/clubs/${clubSlug}/members`)}
                className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Manage Members
                </span>
              </button>
            )}
            
            {club.features?.includes('events') && (
              <button
                onClick={() => navigate(`/clubs/${clubSlug}/events`)}
                className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <PlusIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  Create Event
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isMember ? renderMemberView() : renderPublicView()}
    </div>
  );
};

export default ClubDashboard;
