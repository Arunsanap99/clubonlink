import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClubCustomization } from '../../contexts/ClubCustomizationContext';
import { 
  SunIcon, 
  MoonIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EyeIcon,
  UserGroupIcon,
  CalendarIcon,
  SpeakerWaveIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const PreviewPane = () => {
  const { customizations, clubData } = useClubCustomization();
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, mobile
  const [darkMode, setDarkMode] = useState(false);

  // Get feature icons
  const featureIcons = {
    members: UserGroupIcon,
    events: CalendarIcon,
    announcements: SpeakerWaveIcon,
    attendance: ClipboardDocumentCheckIcon
  };

  // Get active social links
  const getActiveSocialLinks = () => {
    return Object.entries(customizations.socialLinks).filter(([_, url]) => url.trim() !== '');
  };

  // Get visible pages
  const getVisiblePages = () => {
    return Object.entries(customizations.pages).filter(([_, page]) => page.enabled);
  };

  // Generate preview based on template and layout
  const renderPreviewContent = () => {
    const themeColor = customizations.themeColor;
    const isDark = darkMode;
    
    const baseClasses = `transition-all duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`;

    if (clubData?.template === 'classic') {
      return (
        <div className={`${baseClasses} h-full flex`}>
          {/* Sidebar */}
          <div className={`w-1/4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-3 space-y-2`}>
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-4">
              {customizations.logoUrl ? (
                <img 
                  src={customizations.logoUrl} 
                  alt="Logo" 
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: themeColor }}
                >
                  {customizations.clubName?.charAt(0) || 'C'}
                </div>
              )}
              <span className="text-xs font-semibold truncate">
                {customizations.clubName || 'Club Name'}
              </span>
            </div>

            {/* Navigation */}
            <div className="space-y-1">
              <div className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                Dashboard
              </div>
              {getVisiblePages().map(([pageId, page]) => (
                <div key={pageId} className="px-2 py-1 text-xs opacity-75 capitalize">
                  {page.title}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 space-y-3">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-lg font-bold" style={{ color: themeColor }}>
                {customizations.clubName || 'Your Club Name'}
              </h1>
              <p className="text-xs opacity-75">
                {customizations.tagline || 'Your club tagline goes here'}
              </p>
            </div>

            {/* Banner */}
            {customizations.bannerUrl && (
              <div className="h-16 rounded overflow-hidden">
                <img 
                  src={customizations.bannerUrl} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2">
              {clubData?.features?.map((featureId) => {
                const IconComponent = featureIcons[featureId];
                return (
                  <div 
                    key={featureId}
                    className={`p-3 rounded border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    {IconComponent && (
                      <IconComponent 
                        className="w-4 h-4 mb-1" 
                        style={{ color: themeColor }}
                      />
                    )}
                    <p className="text-xs font-medium capitalize">{featureId}</p>
                    <p className="text-xs opacity-50">Coming soon</p>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            {getActiveSocialLinks().length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium">Connect with us:</p>
                <div className="flex flex-wrap gap-1">
                  {getActiveSocialLinks().map(([platform, url]) => (
                    <div 
                      key={platform}
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: themeColor, color: 'white' }}
                    >
                      {platform}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (clubData?.template === 'creative') {
      return (
        <div className={`${baseClasses} h-full p-4 space-y-4`}>
          {/* Header */}
          <div className="text-center space-y-2">
            {customizations.logoUrl ? (
              <img 
                src={customizations.logoUrl} 
                alt="Logo" 
                className="w-12 h-12 mx-auto rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: themeColor }}
              >
                {customizations.clubName?.charAt(0) || 'C'}
              </div>
            )}
            <h1 className="text-lg font-bold" style={{ color: themeColor }}>
              {customizations.clubName || 'Your Club Name'}
            </h1>
            <p className="text-xs opacity-75">
              {customizations.tagline || 'Your club tagline goes here'}
            </p>
          </div>

          {/* Banner */}
          {customizations.bannerUrl && (
            <div className="h-20 rounded-lg overflow-hidden">
              <img 
                src={customizations.bannerUrl} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {clubData?.features?.map((featureId) => {
              const IconComponent = featureIcons[featureId];
              return (
                <div 
                  key={featureId}
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  {IconComponent && (
                    <IconComponent 
                      className="w-6 h-6 mx-auto mb-1" 
                      style={{ color: themeColor }}
                    />
                  )}
                  <p className="text-xs font-medium capitalize">{featureId}</p>
                </div>
              );
            })}
          </div>

          {/* Pages */}
          {getVisiblePages().length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium">Pages:</p>
              <div className="flex flex-wrap gap-1">
                {getVisiblePages().map(([pageId, page]) => (
                  <div 
                    key={pageId}
                    className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    {page.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (clubData?.template === 'minimal') {
      return (
        <div className={`${baseClasses} h-full p-6 space-y-6`}>
          {/* Header */}
          <div className="border-b pb-4" style={{ borderColor: `${themeColor}40` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {customizations.logoUrl ? (
                  <img 
                    src={customizations.logoUrl} 
                    alt="Logo" 
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: themeColor }}
                  >
                    {customizations.clubName?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h1 className="text-sm font-bold">
                    {customizations.clubName || 'Your Club Name'}
                  </h1>
                  <p className="text-xs opacity-60">
                    {customizations.tagline || 'Your club tagline'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                {getVisiblePages().map(([pageId]) => (
                  <div key={pageId} className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: themeColor }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {customizations.bannerUrl && (
              <div className="h-16 rounded overflow-hidden opacity-80">
                <img 
                  src={customizations.bannerUrl} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              {clubData?.features?.map((featureId, index) => (
                <div key={featureId} className="flex items-center space-x-2 py-1">
                  <div className="w-1 h-4" style={{ backgroundColor: themeColor }}></div>
                  <span className="text-xs capitalize">{featureId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default preview
    return (
      <div className={`${baseClasses} h-full flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: themeColor }}
          >
            {customizations.clubName?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-lg font-bold">
              {customizations.clubName || 'Your Club Name'}
            </h1>
            <p className="text-sm opacity-75">
              {customizations.tagline || 'Your club tagline goes here'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Preview Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <EyeIcon className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Live Preview
            </h3>
          </div>
          
          {/* Preview Controls */}
          <div className="flex items-center space-x-2">
            {/* Device Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1 rounded ${
                  previewMode === 'desktop'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <ComputerDesktopIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1 rounded ${
                  previewMode === 'mobile'
                    ? 'bg-white dark:bg-gray-600 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <DevicePhoneMobileIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <SunIcon className="w-4 h-4 text-yellow-500" />
              ) : (
                <MoonIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Preview Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Template: <span className="capitalize font-medium">{clubData?.template || 'Loading...'}</span>
          {customizations.layout && (
            <>
              {' • '}Layout: <span className="capitalize font-medium">{customizations.layout}</span>
            </>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${previewMode}-${darkMode}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'w-64 h-96 mx-auto' : 'w-full h-80'
            }`}
          >
            {renderPreviewContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Preview Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Active Features</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {clubData?.features?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Visible Pages</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {getVisiblePages().length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Social Links</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {getActiveSocialLinks().length}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Theme Color</p>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: customizations.themeColor }}
              ></div>
              <span className="font-mono text-xs text-gray-900 dark:text-white">
                {customizations.themeColor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPane;
