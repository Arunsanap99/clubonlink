import React from 'react';
import { motion } from 'framer-motion';
import { useClubCustomization } from '../../contexts/ClubCustomizationContext';
import { 
  EyeIcon, 
  EyeSlashIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const PagesTab = () => {
  const { 
    customizations, 
    updatePageSettings
  } = useClubCustomization();

  const pageIcons = {
    about: DocumentTextIcon,
    team: UserGroupIcon,
    contact: PhoneIcon
  };

  const pageDescriptions = {
    about: 'Share your club\'s story, mission, and values',
    team: 'Showcase your leadership team and key members',
    contact: 'Provide contact information and meeting details'
  };

  const togglePageVisibility = (pageId) => {
    const currentPage = customizations.pages[pageId];
    updatePageSettings(pageId, { enabled: !currentPage.enabled });
  };

  const updatePageTitle = (pageId, title) => {
    updatePageSettings(pageId, { title });
  };

  const updatePageContent = (pageId, content) => {
    updatePageSettings(pageId, { content });
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

  const cardVariants = {
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Manage Club Pages
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Configure which pages are visible and customize their content
        </p>
      </div>

      {/* Pages List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {Object.entries(customizations.pages).map(([pageId, pageData]) => {
          const IconComponent = pageIcons[pageId];
          const isEnabled = pageData.enabled;

          return (
            <motion.div
              key={pageId}
              variants={cardVariants}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all ${
                isEnabled
                  ? 'border-indigo-200 dark:border-indigo-800 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 opacity-75'
              }`}
            >
              <div className="p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isEnabled 
                        ? 'bg-indigo-100 dark:bg-indigo-900' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isEnabled 
                          ? 'text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {pageId} Page
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {pageDescriptions[pageId]}
                      </p>
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${
                      isEnabled 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isEnabled ? 'Visible' : 'Hidden'}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => togglePageVisibility(pageId)}
                      className={`p-2 rounded-lg transition-colors ${
                        isEnabled
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isEnabled ? (
                        <EyeIcon className="w-5 h-5" />
                      ) : (
                        <EyeSlashIcon className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Page Configuration */}
                {isEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
                  >
                    {/* Page Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={pageData.title}
                        onChange={(e) => updatePageTitle(pageId, e.target.value)}
                        placeholder={`Enter ${pageId} page title`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Page Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Page Content
                      </label>
                      <textarea
                        value={pageData.content}
                        onChange={(e) => updatePageContent(pageId, e.target.value)}
                        placeholder={`Enter content for your ${pageId} page...`}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white resize-none"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You can use basic formatting and links in your content
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Page Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Page Summary
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(customizations.pages).map(([pageId, pageData]) => (
            <div key={pageId} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                pageData.enabled 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {React.createElement(pageIcons[pageId], {
                  className: `w-6 h-6 ${
                    pageData.enabled 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`
                })}
              </div>
              <p className={`text-sm font-medium capitalize ${
                pageData.enabled 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {pageId}
              </p>
              <p className={`text-xs ${
                pageData.enabled 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {pageData.enabled ? 'Visible' : 'Hidden'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">📄</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Page Management Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enable only the pages you need to keep navigation clean</li>
              <li>• Use clear, descriptive titles that match your club's tone</li>
              <li>• Keep content concise but informative</li>
              <li>• You can always add more pages later as your club grows</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PagesTab;
