import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useMemberManagement } from '../../contexts/MemberManagementContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  CogIcon,
  UserGroupIcon,
  KeyIcon,
  PaintBrushIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ClubAdmin = () => {
  const { 
    club, 
    clubMembers, 
    isOwner, 
    isAdmin,
    getClubStats 
  } = useClubPortal();
  
  const { 
    createAccessKey, 
    getClubAccessKeys,
    revokeAccessKey 
  } = useMemberManagement();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [clubSettings, setClubSettings] = useState({
    allowPublicJoin: club?.settings?.allowPublicJoin || false,
    requireApproval: club?.settings?.requireApproval || true,
    maxMembers: club?.settings?.maxMembers || 100
  });

  const stats = getClubStats();

  const handleUpdateSettings = async () => {
    if (!club?.id) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', club.id), {
        settings: clubSettings,
        lastUpdatedAt: new Date().toISOString()
      });
      
      toast.success('Club settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBulkAccessKeys = async () => {
    if (!club?.id) return;

    setLoading(true);
    try {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(createAccessKey(club.id, {
          maxUses: 5,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }));
      }
      
      await Promise.all(promises);
      toast.success('5 access keys created successfully!');
    } catch (error) {
      console.error('Error creating bulk access keys:', error);
      toast.error('Failed to create access keys');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You need admin privileges to access this section.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'members', name: 'Member Management', icon: UserGroupIcon },
    { id: 'access', name: 'Access Control', icon: KeyIcon },
    { id: 'settings', name: 'Club Settings', icon: CogIcon },
    { id: 'branding', name: 'Branding', icon: PaintBrushIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Club Administration
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your club settings, members, and configurations
        </p>
      </div>

      {/* Admin Status */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isOwner ? 'Club Owner' : 'Club Administrator'}
            </h3>
            <p className="text-indigo-100">
              You have {isOwner ? 'full' : 'administrative'} access to manage this club
            </p>
          </div>
          <CogIcon className="h-12 w-12 text-indigo-200" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Members
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalMembers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Upcoming Events
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.upcomingEvents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Recent Announcements
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.recentAnnouncements}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Club Status
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {club?.status === 'published' ? 'Live' : 'Draft'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        Club was published and is now live
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {club?.publishedAt && new Date(club.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {clubMembers.length} members have joined
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Latest member joined recently
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Member Management
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {clubMembers.filter(m => m.role === 'member').length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Regular Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {clubMembers.filter(m => m.role === 'moderator').length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Moderators</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {clubMembers.filter(m => ['admin', 'owner'].includes(m.role)).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Administrators</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Go to the Members page to manage individual member roles and permissions.
                  </p>
                  <button
                    onClick={() => window.location.href = `/clubs/${club?.clubSlug}/members`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Manage Members
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Access Key Management
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create and manage access keys for new members to join your club.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleCreateBulkAccessKeys}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create 5 Access Keys'}
                  </button>
                  
                  <button
                    onClick={() => window.location.href = `/clubs/${club?.clubSlug}/members`}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    View All Keys
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Club Settings
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Allow Public Join
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow anyone to join without an access key
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clubSettings.allowPublicJoin}
                    onChange={(e) => setClubSettings({
                      ...clubSettings,
                      allowPublicJoin: e.target.checked
                    })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Require Approval
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      New members need admin approval to join
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={clubSettings.requireApproval}
                    onChange={(e) => setClubSettings({
                      ...clubSettings,
                      requireApproval: e.target.checked
                    })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Maximum Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={clubSettings.maxMembers}
                    onChange={(e) => setClubSettings({
                      ...clubSettings,
                      maxMembers: parseInt(e.target.value) || 100
                    })}
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleUpdateSettings}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Club Branding
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Customize your club's appearance and branding.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Club Name
                    </label>
                    <input
                      type="text"
                      value={club?.clubName || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Contact support to change your club name
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Club URL
                    </label>
                    <input
                      type="text"
                      value={`${window.location.origin}${club?.route || ''}`}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: club?.themeColor || '#6366f1' }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {club?.themeColor || '#6366f1'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Advanced branding options coming soon!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubAdmin;
