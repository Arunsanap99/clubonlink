import React from 'react';
import { motion } from 'framer-motion';
import { useClubCustomization } from '../../contexts/ClubCustomizationContext';
import { 
  LinkIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SocialLinksTab = () => {
  const { 
    customizations, 
    updateNestedCustomization
  } = useClubCustomization();

  const socialPlatforms = [
    {
      id: 'discord',
      name: 'Discord',
      placeholder: 'https://discord.gg/your-server',
      icon: '💬',
      color: 'bg-indigo-500',
      description: 'Connect with members in real-time'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      placeholder: 'https://instagram.com/yourclub',
      icon: '📸',
      color: 'bg-pink-500',
      description: 'Share photos and updates'
    },
    {
      id: 'website',
      name: 'Website',
      placeholder: 'https://yourclub.com',
      icon: '🌐',
      color: 'bg-blue-500',
      description: 'Your official website'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      placeholder: 'https://twitter.com/yourclub',
      icon: '🐦',
      color: 'bg-sky-500',
      description: 'Share quick updates and news'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      placeholder: 'https://linkedin.com/company/yourclub',
      icon: '💼',
      color: 'bg-blue-600',
      description: 'Professional networking'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      placeholder: 'https://youtube.com/@yourclub',
      icon: '📺',
      color: 'bg-red-500',
      description: 'Share videos and tutorials'
    }
  ];

  const updateSocialLink = (platform, url) => {
    updateNestedCustomization('socialLinks', platform, url);
  };

  const isValidUrl = (url) => {
    if (!url) return null; // Empty is okay
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getActiveLinks = () => {
    return Object.entries(customizations.socialLinks).filter(([_, url]) => url.trim() !== '');
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
          Social Media Links
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Connect your club's social media accounts to help members stay engaged
        </p>
      </div>

      {/* Social Links Form */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {socialPlatforms.map((platform) => {
          const currentUrl = customizations.socialLinks[platform.id] || '';
          const urlValid = isValidUrl(currentUrl);

          return (
            <motion.div
              key={platform.id}
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Platform Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {platform.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {platform.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {platform.description}
                  </p>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => updateSocialLink(platform.id, e.target.value)}
                    placeholder={platform.placeholder}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:bg-gray-700 dark:text-white ${
                      urlValid === false
                        ? 'border-red-300 dark:border-red-600'
                        : urlValid === true
                        ? 'border-green-300 dark:border-green-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  
                  {/* Validation Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {urlValid === true && (
                      <CheckIcon className="w-5 h-5 text-green-500" />
                    )}
                    {urlValid === false && (
                      <XMarkIcon className="w-5 h-5 text-red-500" />
                    )}
                    {urlValid === null && currentUrl && (
                      <LinkIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Validation Message */}
                {urlValid === false && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Please enter a valid URL
                  </p>
                )}
                {urlValid === true && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Valid URL
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Active Links Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Active Social Links ({getActiveLinks().length})
        </h4>
        
        {getActiveLinks().length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No social links added yet
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getActiveLinks().map(([platformId, url]) => {
              const platform = socialPlatforms.find(p => p.id === platformId);
              return (
                <motion.div
                  key={platformId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                    {platform.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {platform.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {url}
                    </p>
                  </div>
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
          Social Links Preview
        </h4>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
          This is how your social links will appear on your club page:
        </p>
        
        <div className="flex flex-wrap gap-3">
          {getActiveLinks().length === 0 ? (
            <p className="text-indigo-600 dark:text-indigo-400 text-sm italic">
              Add social links to see preview
            </p>
          ) : (
            getActiveLinks().map(([platformId, url]) => {
              const platform = socialPlatforms.find(p => p.id === platformId);
              return (
                <motion.a
                  key={platformId}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center space-x-2 px-4 py-2 ${platform.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <span>{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                </motion.a>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">🔗</div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Social Media Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use your complete URLs including https://</li>
              <li>• Keep your social accounts active and engaging</li>
              <li>• Consider which platforms your members use most</li>
              <li>• You can add or remove links anytime</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialLinksTab;
