import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useClubAuth } from '../../hooks/useClubAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  KeyIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const ClubJoin = () => {
  const { clubSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { club, loading: clubLoading } = useClubPortal();
  const { 
    clubMembership, 
    loading: authLoading, 
    processing, 
    joinWithAccessKey,
    isMember 
  } = useClubAuth(club?.id, clubSlug);

  const [accessKey, setAccessKey] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [error, setError] = useState('');

  // Get invite key from URL params
  const inviteKey = searchParams.get('invite');
  const prefilledKey = searchParams.get('key');

  // Auto-fill access key from URL
  useEffect(() => {
    if (inviteKey || prefilledKey) {
      setAccessKey((inviteKey || prefilledKey).toUpperCase());
    }
  }, [inviteKey, prefilledKey]);

  // Auto-join if user is authenticated and has invite key
  useEffect(() => {
    if (currentUser && (inviteKey || prefilledKey) && !isMember() && !processing && !joinSuccess) {
      handleJoinClub(inviteKey || prefilledKey);
    }
  }, [currentUser, inviteKey, prefilledKey, isMember, processing, joinSuccess]);

  const handleJoinClub = async (keyToUse = null) => {
    if (!currentUser) {
      // Redirect to club login with return URL
      navigate(`/clubs/${clubSlug}/login`, {
        state: { 
          returnTo: `/clubs/${clubSlug}/join${keyToUse ? `?key=${keyToUse}` : ''}`,
          message: 'Please sign in to join the club'
        }
      });
      return;
    }

    setError('');
    const key = keyToUse || accessKey;
    
    if (!key.trim()) {
      setError('Please enter an access key');
      return;
    }

    const result = await joinWithAccessKey(key);
    if (result.success) {
      setJoinSuccess(true);
    } else {
      setError(result.error || 'Failed to join club');
    }
  };

  const handleGoToClub = () => {
    navigate(`/clubs/${clubSlug}`);
  };

  if (clubLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading club...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Club Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">The club you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Already a member
  if (isMember()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Already a Member!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You're already a member of {club.clubName}. Access your club portal below.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoToClub}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>Go to Club Portal</span>
            <ArrowRightIcon className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (joinSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to {club.clubName}!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You've successfully joined the club. You now have access to all member features and can participate in club activities.
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToClub}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Enter Club Portal</span>
              <ArrowRightIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {club.logoUrl ? (
                <img 
                  src={club.logoUrl} 
                  alt={`${club.clubName} logo`}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: club.themeColor }}
                >
                  {club.clubName?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Join {club.clubName}
                </h1>
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
              {currentUser && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser.displayName || currentUser.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          {/* Club Info */}
          <div className="text-center mb-8">
            {club.logoUrl ? (
              <img 
                src={club.logoUrl} 
                alt={`${club.clubName} logo`}
                className="w-16 h-16 mx-auto rounded-lg object-cover mb-4"
              />
            ) : (
              <div 
                className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4"
                style={{ backgroundColor: club.themeColor }}
              >
                {club.clubName?.charAt(0)}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {club.clubName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {club.tagline}
            </p>
            <div className="flex justify-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                {club.clubType}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                {club.template} Template
              </span>
            </div>
          </div>

          {/* Authentication Check */}
          {!currentUser ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sign In Required
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You need to be signed in to join this club
              </p>
              <div className="space-y-3">
                <Link
                  to={`/clubs/${clubSlug}/login`}
                  state={{ 
                    returnTo: `/clubs/${clubSlug}/join${accessKey ? `?key=${accessKey}` : ''}`,
                    message: 'Please sign in to join the club'
                  }}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={`/clubs/${clubSlug}/signup`}
                  state={{ accessKey }}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Access Key Input */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Key
                  </label>
                  <input
                    type="text"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character access key"
                    maxLength={8}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-widest"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Get an access key from a club admin or invitation link
                  </p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleJoinClub()}
                  disabled={processing || !accessKey.trim()}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Joining Club...</span>
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="w-4 h-4" />
                      <span>Join Club</span>
                    </>
                  )}
                </motion.button>

                {/* Help Text */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Don't have an access key?{' '}
                    <Link
                      to={`/clubs/${clubSlug}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      View club info
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ClubJoin;
