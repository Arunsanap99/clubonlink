import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useClubCreation } from '../contexts/ClubCreationContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// Import step components
import ClubTypeStep from '../components/club-creation/ClubTypeStep';
import TemplateStep from '../components/club-creation/TemplateStep';
import FeatureStep from '../components/club-creation/FeatureStep';
import ClubDetailsStep from '../components/club-creation/ClubDetailsStep';

const CreateClub = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    currentStep,
    nextStep,
    prevStep,
    canProceedFromStep,
    saveClub,
    resetForm
  } = useClubCreation();

  const steps = [
    { id: 1, name: 'Club Type', component: ClubTypeStep },
    { id: 2, name: 'Template', component: TemplateStep },
    { id: 3, name: 'Features', component: FeatureStep },
    { id: 4, name: 'Details', component: ClubDetailsStep }
  ];

  const handleNext = () => {
    if (canProceedFromStep(currentStep)) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    prevStep();
  };

  const handleFinish = async () => {
    if (canProceedFromStep(currentStep)) {
      const clubId = await saveClub();
      if (clubId) {
        // Navigate to customization page after club creation
        navigate(`/customize-club/${clubId}`);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    navigate('/dashboard');
  };

  const CurrentStepComponent = steps.find(step => step.id === currentStep)?.component;

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Club
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
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Step Indicators */}
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {currentStep > step.id ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </motion.div>
                    <span className={`text-sm font-medium ${
                      currentStep >= step.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`ml-4 w-16 h-0.5 ${
                      currentStep > step.id
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Progress Percentage */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {CurrentStepComponent && <CurrentStepComponent />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </motion.button>

            {/* Cancel Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Cancel
            </motion.button>

            {/* Next/Finish Button */}
            {currentStep < steps.length ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                  canProceedFromStep(currentStep)
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFinish}
                disabled={!canProceedFromStep(currentStep)}
                className={`flex items-center space-x-2 px-8 py-2 rounded-lg font-medium transition-all ${
                  canProceedFromStep(currentStep)
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                <CheckIcon className="w-4 h-4" />
                <span>Create Club</span>
              </motion.button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CreateClub;
