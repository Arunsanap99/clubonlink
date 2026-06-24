import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useMemberManagement } from '../../contexts/MemberManagementContext';
import { 
  UserGroupIcon,
  PlusIcon,
  KeyIcon,
  UserPlusIcon,
  CogIcon,
  TrashIcon,
  XMarkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ClubMembers = () => {
  const { 
    club, 
    clubMembers, 
    userMembership, 
    isAdmin, 
    getMemberRoleDisplay, 
    formatDate 
  } = useClubPortal();
  
  const { 
    createAccessKey, 
    getClubAccessKeys, 
    revokeAccessKey,
    updateMemberRole,
    removeMember,
    loading 
  } = useMemberManagement();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAccessKeysModal, setShowAccessKeysModal] = useState(false);
  const [accessKeys, setAccessKeys] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleCreateAccessKey = async () => {
    if (!club?.id) return;
    
    const accessKey = await createAccessKey(club.id, {
      maxUses: 10,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    
    if (accessKey) {
      setShowInviteModal(false);
      toast.success('Access key created! Share it with new members.');
    }
  };

  const handleViewAccessKeys = async () => {
    if (!club?.id) return;
    
    const keys = await getClubAccessKeys(club.id);
    setAccessKeys(keys || []);
    setShowAccessKeysModal(true);
  };

  const handleCopyAccessKey = (key) => {
    const inviteUrl = `${window.location.origin}/clubs/${club.clubSlug}/join?key=${key.accessKey}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  const handleUpdateRole = async (memberId, newRole) => {
    if (!club?.id) return;
    
    const success = await updateMemberRole(club.id, memberId, newRole);
    if (success) {
      toast.success('Member role updated successfully!');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!club?.id) return;
    
    const success = await removeMember(club.id, memberId);
    if (success) {
      toast.success('Member removed from club');
      setShowMemberModal(false);
      setSelectedMember(null);
    }
  };

  const openMemberModal = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Club Members
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your club's membership and permissions
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Invite Members</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewAccessKeys}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              <KeyIcon className="h-4 w-4" />
              <span>Access Keys</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Members Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Members
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clubMembers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Admins
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clubMembers.filter(m => ['owner', 'admin'].includes(m.role)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserPlusIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                New This Week
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {clubMembers.filter(m => {
                  const joinDate = new Date(m.joinedAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return joinDate > weekAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Members ({clubMembers.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {clubMembers.map((member, index) => {
            const roleDisplay = getMemberRoleDisplay(member.role);
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => openMemberModal(member)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {member.userName?.charAt(0) || member.userEmail?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {member.userName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.userEmail}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleDisplay.color}`}>
                      {roleDisplay.label}
                    </span>
                    
                    {member.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                        {member.status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlusIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Invite New Members
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create an access key that new members can use to join your club.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAccessKey}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Create Access Key
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Keys Modal */}
      <AnimatePresence>
        {showAccessKeysModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAccessKeysModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Access Keys
                </h3>
                <button
                  onClick={() => setShowAccessKeysModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {accessKeys.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No access keys created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {accessKeys.map((key) => (
                    <div key={key.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm text-gray-900 dark:text-white">
                            {key.accessKey}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Uses: {key.usedCount}/{key.maxUses} | Expires: {formatDate(key.expiresAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopyAccessKey(key)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => revokeAccessKey(key.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubMembers;
