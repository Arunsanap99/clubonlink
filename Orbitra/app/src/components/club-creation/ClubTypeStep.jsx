import React from 'react';
import { motion } from 'framer-motion';
import { useClubCreation } from '../../contexts/ClubCreationContext';

const ClubTypeStep = () => {
  const { clubData, clubTypes, setClubType } = useClubCreation();

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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Club Type
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Select the category that best describes your club
        </p>
      </div>

      {/* Club Type Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {clubTypes.map((type) => (
          <motion.div
            key={type.id}
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setClubType(type.id)}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
              clubData.clubType === type.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
            }`}
          >
            {/* Selection Indicator */}
            {clubData.clubType === type.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-4">{type.icon}</div>

            {/* Content */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {type.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {type.description}
            </p>

            {/* Default Features */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Includes:
              </p>
              <div className="flex flex-wrap gap-2">
                {type.defaultFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full capitalize"
                  >
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Selected Type Info */}
      {clubData.clubType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {clubTypes.find(type => type.id === clubData.clubType)?.icon}
            </div>
            <div>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                {clubTypes.find(type => type.id === clubData.clubType)?.name} Selected
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Perfect! Let's move on to selecting your template design.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClubTypeStep;
