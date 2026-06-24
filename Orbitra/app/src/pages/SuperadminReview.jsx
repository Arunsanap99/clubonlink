import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useClubPublishing } from '../contexts/ClubPublishingContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TagIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

const SuperadminReview = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, userRole } = useAuth();
  const {
    publishRequests,
    loading,
    processing,
    approvePublishRequest,
    rejectPublishRequest,
    getClubStats
  } = useClubPublishing();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewRequest, setPreviewRequest] = useState(null);

  // Redirect if not superadmin
  React.useEffect(() => {
    if (userRole && userRole !== 'superadmin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    console.log('SuperadminReview: Attempting to approve request:', selectedRequest);
    const success = await approvePublishRequest(selectedRequest);
    console.log('SuperadminReview: Approval result:', success);
    
    if (success) {
      setShowApproveModal(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    const success = await rejectPublishRequest(selectedRequest, rejectionReason);
    if (success) {
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = getClubStats();

  if (userRole !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Club Review Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Review and approve club publishing requests
                </p>
              </div>
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

              {/* User Info */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                  SUPERADMIN
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingRequests}
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
                <GlobeAltIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Live Clubs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalClubs}
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
                <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Popular Type
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {Object.keys(stats.typeStats).length > 0 
                    ? Object.entries(stats.typeStats).sort(([,a], [,b]) => b - a)[0][0]
                    : 'None'
                  }
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
                <CalendarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {publishRequests.filter(req => {
                    const reqDate = new Date(req.requestedAt);
                    const now = new Date();
                    return reqDate.getMonth() === now.getMonth() && 
                           reqDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Club Reviews
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review club submissions and approve for publishing
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading requests...</p>
            </div>
          ) : publishRequests.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No pending review requests</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                All clubs are up to date!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {publishRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Club Logo/Icon */}
                        <div className="flex-shrink-0">
                          {request.logoUrl ? (
                            <img 
                              src={request.logoUrl} 
                              alt={`${request.clubName} logo`}
                              className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                            />
                          ) : (
                            <div 
                              className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-bold text-xl border-2 border-gray-200 dark:border-gray-600"
                              style={{ backgroundColor: request.themeColor || '#6366f1' }}
                            >
                              {request.clubName?.charAt(0) || 'C'}
                            </div>
                          )}
                        </div>

                        {/* Club Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {request.clubName}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              Pending Review
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <UserIcon className="w-4 h-4 mr-2" />
                                <span>Admin: <span className="font-medium">{request.adminName}</span></span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <TagIcon className="w-4 h-4 mr-2" />
                                <span>Type: <span className="font-medium capitalize">{request.clubType}</span></span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <SwatchIcon className="w-4 h-4 mr-2" />
                                <span>Template: <span className="font-medium capitalize">{request.template}</span></span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                <span>Requested: <span className="font-medium">{formatDate(request.requestedAt)}</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Club Description */}
                          {request.tagline && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 italic">
                              "{request.tagline}"
                            </p>
                          )}

                          {/* Features */}
                          {request.features && request.features.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Requested Features:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {request.features.map((feature) => (
                                  <span 
                                    key={feature}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPreviewRequest(request)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Preview</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openApproveModal(request)}
                        disabled={processing}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>{processing ? 'Publishing...' : 'Approve'}</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openRejectModal(request)}
                        disabled={processing}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Approve Club Publication
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to approve "{selectedRequest?.clubName}"? This will:
                </p>
                <div className="text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li>• Generate a unique club URL</li>
                    <li>• Make the club publicly accessible</li>
                    <li>• Add the admin as club owner</li>
                    <li>• Send approval notification</li>
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                  >
                    {processing ? 'Publishing...' : 'Approve & Publish'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Reject Club Submission
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Provide feedback to help "{selectedRequest?.clubName}" improve their submission.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide specific feedback on what needs to be improved..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                >
                  {processing ? 'Rejecting...' : 'Send Rejection'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperadminReview;
