import React from 'react';
import { motion } from 'framer-motion';
import { useClubCreation } from '../../contexts/ClubCreationContext';

const TemplateStep = () => {
  const { clubData, templates, updateClubData } = useClubCreation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const selectTemplate = (templateId) => {
    updateClubData('template', templateId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Template
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Select a design template that matches your club's personality
        </p>
      </div>

      {/* Template Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-8"
      >
        {templates.map((template) => (
          <motion.div
            key={template.id}
            variants={cardVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectTemplate(template.id)}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer transition-all shadow-lg ${
              clubData.template === template.id
                ? 'ring-4 ring-indigo-500 shadow-2xl'
                : 'hover:shadow-xl hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-600'
            }`}
          >
            {/* Selection Indicator */}
            {clubData.template === template.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}

            {/* Template Preview */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
              {/* Mock Template Preview */}
              <div className={`absolute inset-0 ${getTemplatePreview(template.id)}`}>
                {/* Template-specific preview content */}
                {template.id === 'classic' && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-600 rounded"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-500 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 bg-gray-500 rounded"></div>
                      <div className="h-12 bg-gray-500 rounded"></div>
                      <div className="h-12 bg-gray-500 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-500 rounded"></div>
                      <div className="h-2 bg-gray-500 rounded w-4/5"></div>
                    </div>
                  </div>
                )}

                {template.id === 'creative' && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-purple-600 rounded w-3/4"></div>
                        <div className="h-1.5 bg-purple-400 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
                      <div className="h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-6 bg-purple-400 rounded-full"></div>
                      <div className="h-6 w-6 bg-pink-400 rounded-full"></div>
                      <div className="h-6 w-6 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                )}

                {template.id === 'minimal' && (
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-2 bg-slate-600 rounded w-1/3"></div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-1 bg-slate-600 rounded w-full"></div>
                      <div className="h-1 bg-slate-500 rounded w-4/5"></div>
                      <div className="h-1 bg-slate-500 rounded w-3/5"></div>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-16 h-6 bg-slate-600 rounded"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {template.description}
              </p>

              {/* Color Palette */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color Palette:
                </p>
                <div className="flex space-x-2">
                  {template.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Selected Template Info */}
      {clubData.template && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                {templates.find(t => t.id === clubData.template)?.name} Selected
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Great choice! Now let's select the features for your club.
              </p>
            </div>
            <div className="flex space-x-1">
              {templates.find(t => t.id === clubData.template)?.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-indigo-300"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Helper function to get template-specific styling
const getTemplatePreview = (templateId) => {
  switch (templateId) {
    case 'classic':
      return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900';
    case 'creative':
      return 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20';
    case 'minimal':
      return 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
};

export default TemplateStep;
