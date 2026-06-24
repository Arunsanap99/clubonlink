import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ClubCustomizationContext = createContext();

export const useClubCustomization = () => {
  const context = useContext(ClubCustomizationContext);
  if (!context) {
    throw new Error('useClubCustomization must be used within a ClubCustomizationProvider');
  }
  return context;
};

export const ClubCustomizationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clubData, setClubData] = useState(null);
  const [customizations, setCustomizations] = useState({
    // Branding
    logoUrl: '',
    bannerUrl: '',
    clubName: '',
    tagline: '',
    themeColor: '#6366f1',
    
    // Layout
    layout: 'default', // default, grid, minimal
    
    // Pages
    pages: {
      about: { enabled: true, title: 'About Us', content: '' },
      team: { enabled: true, title: 'Our Team', content: '' },
      contact: { enabled: true, title: 'Contact', content: '' }
    },
    
    // Social Links
    socialLinks: {
      discord: '',
      instagram: '',
      website: '',
      twitter: '',
      linkedin: '',
      youtube: ''
    },
    
    // Theme settings
    darkMode: false
  });

  // Available layouts per template
  const layoutOptions = {
    classic: [
      {
        id: 'default',
        name: 'Default Dashboard',
        description: 'Traditional sidebar with main content area',
        preview: 'classic-default.jpg'
      },
      {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Card-based grid system for better organization',
        preview: 'classic-grid.jpg'
      },
      {
        id: 'minimal',
        name: 'Minimal Clean',
        description: 'Clean minimal layout with focus on content',
        preview: 'classic-minimal.jpg'
      }
    ],
    creative: [
      {
        id: 'default',
        name: 'Creative Hub',
        description: 'Colorful layout with creative elements',
        preview: 'creative-default.jpg'
      },
      {
        id: 'artistic',
        name: 'Artistic Flow',
        description: 'Flowing design with artistic touches',
        preview: 'creative-artistic.jpg'
      },
      {
        id: 'modern',
        name: 'Modern Creative',
        description: 'Modern interpretation of creative design',
        preview: 'creative-modern.jpg'
      }
    ],
    minimal: [
      {
        id: 'default',
        name: 'Tech Minimal',
        description: 'Ultra-clean minimal design',
        preview: 'minimal-default.jpg'
      },
      {
        id: 'focused',
        name: 'Focused View',
        description: 'Single-column focused layout',
        preview: 'minimal-focused.jpg'
      }
    ]
  };

  // Load club data
  const loadClubData = useCallback(async (clubId) => {
    if (!clubId || !currentUser) {
      setLoading(false);
      return false;
    }

    setLoading(true);
    try {
      const clubDoc = await getDoc(doc(db, 'clubs', clubId));
      if (clubDoc.exists()) {
        const data = clubDoc.data();
        
        // Check if current user is the admin of this club
        if (data.adminId !== currentUser.uid) {
          toast.error('You can only customize clubs you created');
          setLoading(false);
          return false;
        }

        setClubData({ id: clubId, ...data });
        
        // Initialize customizations with existing data
        setCustomizations(prev => ({
          ...prev,
          logoUrl: data.logoUrl || '',
          bannerUrl: data.bannerUrl || '',
          clubName: data.clubName || '',
          tagline: data.tagline || '',
          themeColor: data.themeColor || '#6366f1',
          layout: data.layout || 'default',
          pages: data.pages || prev.pages,
          socialLinks: data.socialLinks || prev.socialLinks
        }));
        
        setLoading(false);
        return true;
      } else {
        toast.error('Club not found');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error loading club data:', error);
      toast.error('Failed to load club data');
      setLoading(false);
      return false;
    }
  }, [currentUser]);

  // Update customization field
  const updateCustomization = (field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update nested customization field (for pages, socialLinks)
  const updateNestedCustomization = (section, field, value) => {
    setCustomizations(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Update page settings
  const updatePageSettings = (pageId, settings) => {
    setCustomizations(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: {
          ...prev.pages[pageId],
          ...settings
        }
      }
    }));
  };

  // Upload image to Cloudinary (placeholder function)
  const uploadImage = async (file, type = 'logo') => {
    // This is a placeholder for Cloudinary integration
    // In a real implementation, you would upload to Cloudinary here
    
    try {
      // Create a local preview URL for now
      const previewUrl = URL.createObjectURL(file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, return Cloudinary URL
      // const cloudinaryUrl = await uploadToCloudinary(file);
      // return cloudinaryUrl;
      
      toast.success(`${type} uploaded successfully!`);
      return previewUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Failed to upload ${type}`);
      throw error;
    }
  };

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!clubData || !currentUser) return false;

    setSaving(true);
    try {
      const updateData = {
        ...customizations,
        lastUpdatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'clubs', clubData.id), updateData);
      
      // Update local club data
      setClubData(prev => ({ ...prev, ...updateData }));
      
      toast.success('Draft saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
      return false;
    } finally {
      setSaving(false);
    }
  }, [clubData, currentUser, customizations]);

  // Request publish
  const requestPublish = useCallback(async () => {
    if (!clubData || !currentUser) return false;

    setSaving(true);
    try {
      // First save the current customizations
      await saveDraft();

      // Update club status to 'review'
      await updateDoc(doc(db, 'clubs', clubData.id), {
        status: 'review'
      });

      // Create publish request with complete club data
      const publishRequest = {
        clubId: clubData.id,
        clubName: customizations.clubName || clubData.clubName,
        clubType: clubData.clubType,
        template: clubData.template,
        features: clubData.features || [],
        tagline: customizations.tagline || clubData.tagline,
        themeColor: customizations.themeColor || clubData.themeColor,
        logoUrl: customizations.logoUrl || clubData.logoUrl,
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, 'publishRequests'), publishRequest);

      // Update local club data
      setClubData(prev => ({ ...prev, status: 'review' }));

      toast.success('Publish request submitted! A Superadmin will review your club.');
      return true;
    } catch (error) {
      console.error('Error requesting publish:', error);
      toast.error('Failed to submit publish request');
      return false;
    } finally {
      setSaving(false);
    }
  }, [clubData, currentUser, customizations, saveDraft]);

  // Get available layouts for current template
  const getAvailableLayouts = () => {
    if (!clubData?.template) return [];
    return layoutOptions[clubData.template] || [];
  };

  // Reset customizations
  const resetCustomizations = () => {
    if (!clubData) return;
    
    setCustomizations({
      logoUrl: clubData.logoUrl || '',
      bannerUrl: clubData.bannerUrl || '',
      clubName: clubData.clubName || '',
      tagline: clubData.tagline || '',
      themeColor: clubData.themeColor || '#6366f1',
      layout: clubData.layout || 'default',
      pages: clubData.pages || {
        about: { enabled: true, title: 'About Us', content: '' },
        team: { enabled: true, title: 'Our Team', content: '' },
        contact: { enabled: true, title: 'Contact', content: '' }
      },
      socialLinks: clubData.socialLinks || {
        discord: '',
        instagram: '',
        website: '',
        twitter: '',
        linkedin: '',
        youtube: ''
      },
      darkMode: false
    });
  };

  const value = {
    // State
    loading,
    saving,
    clubData,
    customizations,
    layoutOptions,
    
    // Actions
    loadClubData,
    updateCustomization,
    updateNestedCustomization,
    updatePageSettings,
    uploadImage,
    saveDraft,
    requestPublish,
    getAvailableLayouts,
    resetCustomizations
  };

  return (
    <ClubCustomizationContext.Provider value={value}>
      {children}
    </ClubCustomizationContext.Provider>
  );
};
