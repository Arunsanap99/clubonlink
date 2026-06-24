import React from 'react';
import { motion } from 'framer-motion';
import { useClubCustomization } from '../../contexts/ClubCustomizationContext';
import { CheckIcon } from '@heroicons/react/24/outline';

const LayoutTab = () => {
  const { 
    customizations, 
    updateCustomization, 
    getAvailableLayouts,
    clubData
  } = useClubCustomization();

  const availableLayouts = getAvailableLayouts();

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

  // Mock layout previews based on template and layout
  const getLayoutPreview = (templateId, layoutId) => {
    const baseClasses = "absolute inset-0 p-3 space-y-2";
    
    if (templateId === 'classic') {
      switch (layoutId) {
        case 'default':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}>
              <div className="flex space-x-2 h-full">
                <div className="w-1/4 bg-gray-600 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-1/4 bg-gray-500 rounded"></div>
                  <div className="h-1/2 bg-gray-400 rounded"></div>
                  <div className="h-1/4 bg-gray-500 rounded"></div>
                </div>
              </div>
            </div>
          );
        case 'grid':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}>
              <div className="h-1/4 bg-gray-600 rounded mb-2"></div>
              <div className="grid grid-cols-3 gap-1 h-2/3">
                <div className="bg-gray-500 rounded"></div>
                <div className="bg-gray-500 rounded"></div>
                <div className="bg-gray-500 rounded"></div>
                <div className="bg-gray-400 rounded"></div>
                <div className="bg-gray-400 rounded"></div>
                <div className="bg-gray-400 rounded"></div>
              </div>
            </div>
          );
        case 'minimal':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}>
              <div className="space-y-3 h-full">
                <div className="h-1/6 bg-gray-600 rounded"></div>
                <div className="h-1/2 bg-gray-400 rounded"></div>
                <div className="h-1/4 bg-gray-500 rounded"></div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    if (templateId === 'creative') {
      switch (layoutId) {
        case 'default':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20`}>
              <div className="space-y-2 h-full">
                <div className="h-1/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                <div className="flex space-x-2 h-1/2">
                  <div className="w-1/2 bg-gradient-to-br from-blue-400 to-purple-400 rounded"></div>
                  <div className="w-1/2 bg-gradient-to-br from-pink-400 to-red-400 rounded"></div>
                </div>
                <div className="h-1/4 bg-gradient-to-r from-indigo-400 to-blue-400 rounded"></div>
              </div>
            </div>
          );
        case 'artistic':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20`}>
              <div className="relative h-full">
                <div className="absolute top-0 left-0 w-3/4 h-1/2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-80"></div>
                <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-80"></div>
                <div className="absolute top-1/4 right-1/4 w-1/3 h-1/3 bg-gradient-to-br from-pink-400 to-red-400 rounded-full opacity-90"></div>
              </div>
            </div>
          );
        case 'modern':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20`}>
              <div className="grid grid-cols-2 gap-2 h-full">
                <div className="space-y-2">
                  <div className="h-1/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                  <div className="h-2/3 bg-gradient-to-br from-blue-400 to-purple-400 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2/3 bg-gradient-to-br from-pink-400 to-red-400 rounded"></div>
                  <div className="h-1/3 bg-gradient-to-r from-indigo-400 to-blue-400 rounded"></div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    if (templateId === 'minimal') {
      switch (layoutId) {
        case 'default':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900`}>
              <div className="space-y-3 h-full">
                <div className="flex justify-between items-center">
                  <div className="h-2 bg-slate-600 rounded w-1/3"></div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-1 bg-slate-600 rounded w-full"></div>
                  <div className="h-1 bg-slate-500 rounded w-4/5"></div>
                  <div className="h-1 bg-slate-500 rounded w-3/5"></div>
                </div>
                <div className="flex justify-end">
                  <div className="w-16 h-4 bg-slate-600 rounded"></div>
                </div>
              </div>
            </div>
          );
        case 'focused':
          return (
            <div className={`${baseClasses} bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900`}>
              <div className="flex justify-center h-full">
                <div className="w-2/3 space-y-3">
                  <div className="h-1/6 bg-slate-600 rounded"></div>
                  <div className="h-2/3 bg-slate-400 rounded"></div>
                  <div className="h-1/6 bg-slate-500 rounded"></div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }

    return null;
  };

  if (!clubData?.template) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Loading layout options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Layout Style
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Select a layout that best fits your club's content structure
        </p>
      </div>

      {/* Layout Options */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {availableLayouts.map((layout) => (
          <motion.div
            key={layout.id}
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateCustomization('layout', layout.id)}
            className={`relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all shadow-lg ${
              customizations.layout === layout.id
                ? 'ring-4 ring-indigo-500 shadow-2xl'
                : 'hover:shadow-xl hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-600'
            }`}
          >
            {/* Selection Indicator */}
            {customizations.layout === layout.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckIcon className="w-5 h-5 text-white" />
              </motion.div>
            )}

            {/* Layout Preview */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
              {getLayoutPreview(clubData.template, layout.id)}
            </div>

            {/* Layout Info */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {layout.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {layout.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Selected Layout Info */}
      {customizations.layout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                {availableLayouts.find(l => l.id === customizations.layout)?.name} Selected
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                {availableLayouts.find(l => l.id === customizations.layout)?.description}
              </p>
            </div>
            <div className="text-indigo-600 dark:text-indigo-400">
              <CheckIcon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Layout Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Layout Features
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Responsive design</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Mobile optimized</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Dark mode support</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Customizable colors</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Feature modules</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">Easy navigation</span>
            </div>
          </div>
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
          <div className="text-blue-500 text-xl">🎨</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Layout Selection Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Consider your club's primary activities when choosing layout</li>
              <li>• Grid layouts work well for clubs with lots of visual content</li>
              <li>• Minimal layouts are perfect for text-heavy or professional clubs</li>
              <li>• You can change the layout anytime in customization settings</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LayoutTab;
