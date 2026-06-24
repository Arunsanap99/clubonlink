import React from 'react';
import { motion } from 'framer-motion';
import { useClubCreation } from '../../contexts/ClubCreationContext';

const FeatureStep = () => {
  const { clubData, availableFeatures, toggleFeature } = useClubCreation();

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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Select Features
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Choose which features you want to include in your club
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Features List */}
        <div className="lg:col-span-2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {availableFeatures.map((feature) => {
              const isSelected = clubData.features.includes(feature.id);
              const isRequired = feature.required;

              return (
                <motion.div
                  key={feature.id}
                  variants={cardVariants}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } ${
                    isRequired
                      ? 'opacity-100'
                      : 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                  }`}
                  onClick={() => !isRequired && toggleFeature(feature.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Feature Icon */}
                      <div className={`text-2xl p-3 rounded-lg ${
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-800'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {feature.icon}
                      </div>

                      {/* Feature Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {feature.name}
                          </h3>
                          {isRequired && (
                            <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="ml-4">
                      <motion.div
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          isSelected
                            ? 'bg-indigo-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        } ${isRequired ? 'opacity-50' : 'cursor-pointer'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isRequired) toggleFeature(feature.id);
                        }}
                      >
                        <motion.div
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                          animate={{
                            x: isSelected ? 24 : 0
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Selected Features
            </h3>

            {clubData.features.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No features selected yet
              </p>
            ) : (
              <div className="space-y-3">
                {clubData.features.map((featureId) => {
                  const feature = availableFeatures.find(f => f.id === featureId);
                  return (
                    <motion.div
                      key={featureId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                    >
                      <span className="text-lg">{feature?.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {feature?.name}
                        </p>
                        {feature?.required && (
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Required
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Feature Count */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Features:
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {clubData.features.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Feature Selection Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Member Management</strong> is required for all clubs</li>
              <li>• You can always add or remove features later in club settings</li>
              <li>• Start with essential features and expand as your club grows</li>
              <li>• Each feature can be customized to match your club's needs</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureStep;
