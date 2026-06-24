import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useClubAuth } from '../../hooks/useClubAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
// Using text-based Google icon to avoid external dependency

const ClubLogin = () => {
  const { clubSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const { club, loading: clubLoading } = useClubPortal();
  const { 
    clubLogin, 
    clubGoogleAuth, 
    processing, 
    isMember 
  } = useClubAuth(club?.id, clubSlug);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Get return URL and message from location state
  const returnTo = location.state?.returnTo || `/clubs/${clubSlug}`;
  const message = location.state?.message;

  // Redirect if already authenticated and member
  useEffect(() => {
    if (currentUser && isMember()) {
      navigate(returnTo);
    }
  }, [currentUser, isMember, navigate, returnTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await clubLogin(formData.email, formData.password);
    if (result.success) {
      navigate(returnTo);
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const result = await clubGoogleAuth();
    if (result.success) {
      navigate(returnTo);
    } else if (!result.cancelled) {
      // Only show error if not cancelled by user
      setError(result.error);
    }
  };

  if (clubLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to={`/clubs/${clubSlug}`}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
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
                  Sign In to {club.clubName}
                </h1>
              </div>
            </div>
            
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
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access {club.clubName}
            </p>
          </div>

          {/* Message from redirect */}
          {message && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">{message}</p>
            </div>
          )}

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={processing}
            className="w-full mb-6 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
              G
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {processing ? 'Signing in...' : 'Continue with Google'}
            </span>
          </motion.button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
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

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={processing}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              {processing ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to={`/clubs/${clubSlug}/signup`}
                state={location.state}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Global Login Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Looking for the main app?{' '}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in to ClubHub
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ClubLogin;
