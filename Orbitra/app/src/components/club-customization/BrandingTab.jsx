import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClubCustomization } from '../../contexts/ClubCustomizationContext';
import { 
  PhotoIcon, 
  SwatchIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const BrandingTab = () => {
  const { 
    customizations, 
    updateCustomization, 
    uploadImage,
    saving 
  } = useClubCustomization();
  
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const imageUrl = await uploadImage(file, type);
      updateCustomization(`${type}Url`, imageUrl);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeImage = (type) => {
    updateCustomization(`${type}Url`, '');
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
      {/* Club Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Club Name
        </label>
        <input
          type="text"
          value={customizations.clubName}
          onChange={(e) => updateCustomization('clubName', e.target.value)}
          placeholder="Enter your club name"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
        />
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tagline
        </label>
        <input
          type="text"
          value={customizations.tagline}
          onChange={(e) => updateCustomization('tagline', e.target.value)}
          placeholder="A short description of your club"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white"
        />
      </motion.div>

      {/* Logo Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Club Logo
        </label>
        <div className="flex items-start space-x-4">
          {/* Logo Preview */}
          <div className="relative">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
              {customizations.logoUrl ? (
                <>
                  <img
                    src={customizations.logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage('logo')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <PhotoIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-2">
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
              className="hidden"
              disabled={uploading.logo}
            />
            <label
              htmlFor="logo-upload"
              className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                uploading.logo ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading.logo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Choose Logo
                </>
              )}
            </label>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Recommended: 200x200px</p>
              <p>PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Banner Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Club Banner
        </label>
        <div className="space-y-4">
          {/* Banner Preview */}
          <div className="relative">
            <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
              {customizations.bannerUrl ? (
                <>
                  <img
                    src={customizations.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage('banner')}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Banner Preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Controls */}
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
              className="hidden"
              disabled={uploading.banner}
            />
            <label
              htmlFor="banner-upload"
              className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                uploading.banner ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading.banner ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                  Choose Banner
                </>
              )}
            </label>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Recommended: 1600x400px • PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Color */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme Color
        </label>
        
        {/* Color Grid */}
        <div className="grid grid-cols-6 gap-3">
          {colorOptions.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateCustomization('themeColor', color.value)}
              className={`relative w-12 h-12 rounded-lg shadow-md transition-all ${
                customizations.themeColor === color.value
                  ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500'
                  : 'hover:shadow-lg'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {customizations.themeColor === color.value && (
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
        <div className="flex items-center space-x-3 pt-2">
          <SwatchIcon className="w-5 h-5 text-gray-400" />
          <input
            type="color"
            value={customizations.themeColor}
            onChange={(e) => updateCustomization('themeColor', e.target.value)}
            className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Custom color: {customizations.themeColor}
          </span>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Branding Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use high-quality images for better visual impact</li>
              <li>• Keep your logo simple and recognizable at small sizes</li>
              <li>• Choose colors that reflect your club's personality</li>
              <li>• Banner should complement your logo and theme color</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BrandingTab;
