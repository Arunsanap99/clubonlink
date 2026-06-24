import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useClubCustomization } from '../contexts/ClubCustomizationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  PaintBrushIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  LinkIcon,
  CloudArrowUpIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import tab components
import BrandingTab from '../components/club-customization/BrandingTab';
import LayoutTab from '../components/club-customization/LayoutTab';
import PagesTab from '../components/club-customization/PagesTab';
import SocialLinksTab from '../components/club-customization/SocialLinksTab';
import PreviewPane from '../components/club-customization/PreviewPane';

const ClubCustomization = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    loading,
    saving,
    clubData,
    loadClubData,
    saveDraft,
    requestPublish,
    resetCustomizations
  } = useClubCustomization();

  const [activeTab, setActiveTab] = useState('branding');
  const [showPublishModal, setShowPublishModal] = useState(false);

  const tabs = [
    {
      id: 'branding',
      name: 'Branding',
      icon: PaintBrushIcon,
      component: BrandingTab,
      description: 'Logo, colors, and visual identity'
    },
    {
      id: 'layout',
      name: 'Layout',
      icon: RectangleStackIcon,
      component: LayoutTab,
      description: 'Page structure and design'
    },
    {
      id: 'pages',
      name: 'Pages',
      icon: DocumentTextIcon,
      component: PagesTab,
      description: 'Manage page visibility and content'
    },
    {
      id: 'social',
      name: 'Social Links',
      icon: LinkIcon,
      component: SocialLinksTab,
      description: 'Connect social media accounts'
    }
  ];

  // Load club data on mount
  useEffect(() => {
    if (clubId) {
      loadClubData(clubId).then((success) => {
        if (!success) {
          navigate('/dashboard');
        }
      });
    }
  }, [clubId, loadClubData, navigate]);

  const handleSaveDraft = async () => {
    await saveDraft();
  };

  const handleRequestPublish = async () => {
    const success = await requestPublish();
    if (success) {
      setShowPublishModal(false);
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    resetCustomizations();
    navigate('/dashboard');
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading club data...</p>
        </div>
      </div>
    );
  }

  if (!clubData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Club not found or access denied</p>
        </div>
      </div>
    );
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
                onClick={handleCancel}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customize Club
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {clubData.clubName} • {clubData.template} template
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

              {/* Save Draft Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4" />
                    <span>Save Draft</span>
                  </>
                )}
              </motion.button>

              {/* Request Publish Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPublishModal(true)}
                disabled={saving || clubData.status === 'review'}
                className={`px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2 ${
                  clubData.status === 'review'
                    ? 'bg-yellow-500 text-white cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white'
                }`}
              >
                <CheckIcon className="w-4 h-4" />
                <span>
                  {clubData.status === 'review' ? 'Under Review' : 'Request Publish'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Customization Options
              </h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{tab.name}</p>
                      <p className="text-xs opacity-75">{tab.description}</p>
                    </div>
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Center Content - Active Tab */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {ActiveTabComponent && <ActiveTabComponent />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar - Preview */}
          <div className="lg:col-span-1">
            <PreviewPane />
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPublishModal(false)}
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
                  Request Club Publication?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your club will be submitted for review by a Superadmin. Once approved, 
                  it will be published with a unique URL and become accessible to members.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestPublish}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                  >
                    {saving ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClubCustomization;
