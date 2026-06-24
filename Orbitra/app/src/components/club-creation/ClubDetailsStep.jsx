import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClubCreation } from '../../contexts/ClubCreationContext';
import { PhotoIcon, SwatchIcon } from '@heroicons/react/24/outline';

const ClubDetailsStep = () => {
  const { clubData, updateClubData } = useClubCreation();
  const [logoPreview, setLogoPreview] = useState(null);

  const handleInputChange = (field, value) => {
    updateClubData(field, value);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // In a real app, you would upload to Cloudinary here
      // For now, we'll just store the preview URL
      updateClubData('logoUrl', previewUrl);
    }
  };

  const colorOptions = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Lime', value: '#84cc16' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Club Details
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Add the finishing touches to make your club unique
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Club Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Club Name *
            </label>
            <input
              type="text"
              value={clubData.clubName}
              onChange={(e) => handleInputChange('clubName', e.target.value)}
              placeholder="Enter your club name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={clubData.tagline}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="A short description of your club"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
            />
          </motion.div>

          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Club Logo
            </label>
            <div className="flex items-center space-x-4">
              {/* Logo Preview */}
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Choose Logo
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </motion.div>

          {/* Theme Color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme Color
            </label>
            <div className="grid grid-cols-6 gap-3">
              {colorOptions.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleInputChange('themeColor', color.value)}
                  className={`relative w-12 h-12 rounded-lg shadow-md transition-all ${
                    clubData.themeColor === color.value
                      ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500'
                      : 'hover:shadow-lg'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {clubData.themeColor === color.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="mt-3 flex items-center space-x-2">
              <SwatchIcon className="w-5 h-5 text-gray-400" />
              <input
                type="color"
                value={clubData.themeColor}
                onChange={(e) => handleInputChange('themeColor', e.target.value)}
                className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Custom color
              </span>
            </div>
          </motion.div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="sticky top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Club Preview
            </h3>

            {/* Preview Card */}
            <div 
              className="rounded-lg p-6 text-white relative overflow-hidden"
              style={{ backgroundColor: clubData.themeColor }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Logo */}
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <PhotoIcon className="w-8 h-8 text-white/60" />
                  )}
                </div>

                {/* Club Info */}
                <h4 className="text-xl font-bold mb-2">
                  {clubData.clubName || 'Your Club Name'}
                </h4>
                <p className="text-white/80 text-sm mb-4">
                  {clubData.tagline || 'Your club tagline will appear here'}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {clubData.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-white/20 rounded-full capitalize"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Club Stats */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {clubData.clubType || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Template:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {clubData.template || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Features:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {clubData.features.length}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800"
      >
        <div className="flex items-start space-x-3">
          <div className="text-yellow-500 text-xl">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Before You Continue
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Your club will be created with "pending" status</li>
              <li>• A Superadmin will review and approve your club before it goes live</li>
              <li>• You can edit these details later in club settings</li>
              <li>• Logo upload integration with Cloudinary will be added in Step 3</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClubDetailsStep;
