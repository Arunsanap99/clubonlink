import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useMemberManagement } from '../contexts/MemberManagementContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  KeyIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const JoinClub = () => {
  const { accessKey } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { useAccessKey, processing } = useMemberManagement();
  
  const [manualKey, setManualKey] = useState('');
  const [joinResult, setJoinResult] = useState(null);
  const [error, setError] = useState('');

  // Auto-join if access key is in URL
  useEffect(() => {
    if (accessKey && currentUser && !joinResult && !processing) {
      handleJoinClub(accessKey);
    }
  }, [accessKey, currentUser]);

  const handleJoinClub = async (key) => {
    if (!currentUser) {
      navigate('/login', { 
        state: { 
          returnTo: `/join/${key || manualKey}`,
          message: 'Please sign in to join the club'
        }
      });
      return;
    }

    setError('');
    const keyToUse = key || manualKey;
    
    if (!keyToUse.trim()) {
      setError('Please enter an access key');
      return;
    }

    try {
      const result = await useAccessKey(keyToUse);
      if (result) {
        setJoinResult(result);
      }
    } catch (err) {
      setError('Failed to join club. Please try again.');
    }
  };

  const handleGoToClub = () => {
    if (joinResult?.club?.route) {
      navigate(joinResult.club.route);
    } else {
      navigate('/dashboard');
    }
  };

  // Success state
  if (joinResult) {
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
            Welcome to {joinResult.club.clubName}!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You've successfully joined as a <span className="font-semibold capitalize">{joinResult.role}</span>. 
            You now have access to all club features and can participate in activities.
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToClub}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Go to Club Portal</span>
              <ArrowRightIcon className="w-4 h-4" />
            </motion.button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
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
              <KeyIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Join Club
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
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join a Club
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your access key to join a club and connect with other members
            </p>
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
                You need to be signed in to join a club
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login', { 
                    state: { 
                      returnTo: window.location.pathname,
                      message: 'Please sign in to join the club'
                    }
                  })}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Create Account
                </button>
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
                    value={accessKey || manualKey}
                    onChange={(e) => setManualKey(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character access key"
                    maxLength={8}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white text-center text-lg font-mono tracking-widest"
                    disabled={!!accessKey}
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Access keys are 8 characters long and case-insensitive
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleJoinClub()}
                  disabled={processing || (!accessKey && !manualKey.trim())}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Joining Club...</span>
                    </>
                  ) : (
                    <>
                      <KeyIcon className="w-4 h-4" />
                      <span>Join Club</span>
                    </>
                  )}
                </motion.button>

                {/* Help Text */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Don't have an access key?{' '}
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Contact a club admin
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            How it works
          </h3>
          <div className="space-y-3 text-blue-800 dark:text-blue-200 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Get an access key from a club admin or through an invitation link</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>Enter the 8-character access key in the form above</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Instantly join the club and access all member features</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default JoinClub;
