import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useClubPublishing } from '../contexts/ClubPublishingContext';
import { 
  UserGroupIcon,
  CalendarIcon,
  SpeakerWaveIcon,
  ClipboardDocumentCheckIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const PublicClub = () => {
  const { clubSlug } = useParams();
  const { getClubBySlug } = useClubPublishing();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  // Feature icons mapping
  const featureIcons = {
    members: UserGroupIcon,
    events: CalendarIcon,
    announcements: SpeakerWaveIcon,
    attendance: ClipboardDocumentCheckIcon
  };

  // Social platform configs
  const socialPlatforms = {
    discord: { name: 'Discord', icon: '💬', color: 'bg-indigo-500' },
    instagram: { name: 'Instagram', icon: '📸', color: 'bg-pink-500' },
    website: { name: 'Website', icon: '🌐', color: 'bg-blue-500' },
    twitter: { name: 'Twitter', icon: '🐦', color: 'bg-sky-500' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
    youtube: { name: 'YouTube', icon: '📺', color: 'bg-red-500' }
  };

  // Load club data
  useEffect(() => {
    const loadClub = async () => {
      if (!clubSlug) return;
      
      setLoading(true);
      try {
        const clubData = await getClubBySlug(clubSlug);
        setClub(clubData);
      } catch (error) {
        console.error('Error loading club:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [clubSlug, getClubBySlug]);

  // Get active social links
  const getActiveSocialLinks = () => {
    if (!club?.socialLinks) return [];
    return Object.entries(club.socialLinks).filter(([_, url]) => url.trim() !== '');
  };

  // Get visible pages
  const getVisiblePages = () => {
    if (!club?.pages) return [];
    return Object.entries(club.pages).filter(([_, page]) => page.enabled);
  };

  // Render club content based on template
  const renderClubContent = () => {
    if (!club) return null;

    const themeColor = club.themeColor || '#6366f1';

    if (club.template === 'classic') {
      return (
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg">
            <div className="p-6">
              {/* Logo and Name */}
              <div className="flex items-center space-x-3 mb-8">
                {club.logoUrl ? (
                  <img 
                    src={club.logoUrl} 
                    alt={`${club.clubName} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    {club.clubName?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{club.clubName}</h1>
                  <p className="text-sm text-gray-600">{club.tagline}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'home' 
                      ? 'bg-indigo-50 text-indigo-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Home
                </button>
                {getVisiblePages().map(([pageId, page]) => (
                  <button
                    key={pageId}
                    onClick={() => setActiveTab(pageId)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === pageId 
                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {renderTabContent()}
          </div>
        </div>
      );
    }

    if (club.template === 'creative') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
          {/* Header */}
          <header className="text-center py-16 px-8">
            {club.logoUrl ? (
              <img 
                src={club.logoUrl} 
                alt={`${club.clubName} logo`}
                className="w-24 h-24 mx-auto rounded-full object-cover mb-6"
              />
            ) : (
              <div 
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6"
                style={{ backgroundColor: themeColor }}
              >
                {club.clubName?.charAt(0) || 'C'}
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{club.clubName}</h1>
            <p className="text-xl text-gray-600 mb-8">{club.tagline}</p>
            
            {/* Navigation Tabs */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === 'home' 
                    ? 'text-white shadow-lg' 
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
                style={activeTab === 'home' ? { backgroundColor: themeColor } : {}}
              >
                Home
              </button>
              {getVisiblePages().map(([pageId, page]) => (
                <button
                  key={pageId}
                  onClick={() => setActiveTab(pageId)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeTab === pageId 
                      ? 'text-white shadow-lg' 
                      : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
                  style={activeTab === pageId ? { backgroundColor: themeColor } : {}}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-8 pb-16">
            {renderTabContent()}
          </div>
        </div>
      );
    }

    if (club.template === 'minimal') {
      return (
        <div className="min-h-screen bg-white">
          {/* Header */}
          <header className="border-b border-gray-200 py-8 px-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {club.logoUrl ? (
                  <img 
                    src={club.logoUrl} 
                    alt={`${club.clubName} logo`}
                    className="w-16 h-16 rounded object-cover"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: themeColor }}
                  >
                    {club.clubName?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{club.clubName}</h1>
                  <p className="text-gray-600">{club.tagline}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === 'home' ? 'text-gray-900 border-b-2' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={activeTab === 'home' ? { borderColor: themeColor } : {}}
                >
                  Home
                </button>
                {getVisiblePages().map(([pageId, page]) => (
                  <button
                    key={pageId}
                    onClick={() => setActiveTab(pageId)}
                    className={`text-sm font-medium transition-colors ${
                      activeTab === pageId ? 'text-gray-900 border-b-2' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={activeTab === pageId ? { borderColor: themeColor } : {}}
                  >
                    {page.title}
                  </button>
                ))}
              </nav>
            </div>
          </header>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-8 py-16">
            {renderTabContent()}
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{club.clubName}</h1>
          <p className="text-gray-600">{club.tagline}</p>
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    if (!club) return null;

    if (activeTab === 'home') {
      return (
        <div className="space-y-12">
          {/* Banner */}
          {club.bannerUrl && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={club.bannerUrl} 
                alt="Club banner" 
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {club.features?.map((featureId) => {
                const IconComponent = featureIcons[featureId];
                return (
                  <div key={featureId} className="bg-white rounded-xl p-6 shadow-md">
                    {IconComponent && (
                      <IconComponent 
                        className="w-8 h-8 mb-4" 
                        style={{ color: club.themeColor }}
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 capitalize mb-2">{featureId}</h3>
                    <p className="text-gray-600 text-sm">
                      {featureId === 'members' && 'Connect with fellow members'}
                      {featureId === 'events' && 'Join exciting club events'}
                      {featureId === 'announcements' && 'Stay updated with latest news'}
                      {featureId === 'attendance' && 'Track your participation'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Links */}
          {getActiveSocialLinks().length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect With Us</h2>
              <div className="flex flex-wrap gap-4">
                {getActiveSocialLinks().map(([platform, url]) => {
                  const config = socialPlatforms[platform];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 px-6 py-3 ${config.color} text-white rounded-lg hover:opacity-90 transition-opacity shadow-md`}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-medium">{config.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Render page content
    const page = club.pages?.[activeTab];
    if (page) {
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
          <div className="text-gray-700 whitespace-pre-wrap">
            {page.content || 'Content coming soon...'}
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <GlobeAltIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Not Found</h1>
          <p className="text-gray-600">The club you're looking for doesn't exist or isn't published yet.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderClubContent()}
    </motion.div>
  );
};

export default PublicClub;
