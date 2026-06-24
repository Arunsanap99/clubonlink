import React, { createContext, useContext, useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ClubCreationContext = createContext();

export const useClubCreation = () => {
  const context = useContext(ClubCreationContext);
  if (!context) {
    throw new Error('useClubCreation must be used within a ClubCreationProvider');
  }
  return context;
};

export const ClubCreationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [clubData, setClubData] = useState({
    clubType: '',
    template: '',
    features: [],
    clubName: '',
    tagline: '',
    logoUrl: '',
    themeColor: '#6366f1', // Default indigo
    status: 'pending'
  });

  // Club types with descriptions and default features
  const clubTypes = [
    {
      id: 'college',
      name: 'College Clubs',
      description: 'Student organizations, academic clubs, and campus communities',
      icon: '🎓',
      defaultFeatures: ['members', 'events', 'announcements', 'attendance']
    },
    {
      id: 'social',
      name: 'Social',
      description: 'Social groups, hobby clubs, and community gatherings',
      icon: '👥',
      defaultFeatures: ['members', 'events', 'announcements']
    },
    {
      id: 'sports',
      name: 'Sports',
      description: 'Athletic teams, fitness groups, and sports leagues',
      icon: '⚽',
      defaultFeatures: ['members', 'events', 'attendance']
    },
    {
      id: 'community',
      name: 'Community & Service',
      description: 'Volunteer groups, charity organizations, and community service',
      icon: '🤝',
      defaultFeatures: ['members', 'events', 'announcements']
    },
    {
      id: 'corporate',
      name: 'Industry/Corporate',
      description: 'Professional networks, corporate teams, and business groups',
      icon: '💼',
      defaultFeatures: ['members', 'events', 'announcements', 'attendance']
    },
    {
      id: 'gaming',
      name: 'Gaming',
      description: 'Gaming communities, esports teams, and gaming events',
      icon: '🎮',
      defaultFeatures: ['members', 'events', 'announcements']
    }
  ];

  // Available templates
  const templates = [
    {
      id: 'classic',
      name: 'Classic Dashboard',
      description: 'Clean and professional layout with traditional navigation',
      preview: '/templates/classic-preview.jpg',
      colors: ['#1f2937', '#374151', '#6b7280']
    },
    {
      id: 'creative',
      name: 'Creative Vibe',
      description: 'Modern and colorful design with creative elements',
      preview: '/templates/creative-preview.jpg',
      colors: ['#7c3aed', '#a855f7', '#c084fc']
    },
    {
      id: 'minimal',
      name: 'Tech Minimal',
      description: 'Minimalist design focused on functionality and simplicity',
      preview: '/templates/minimal-preview.jpg',
      colors: ['#0f172a', '#1e293b', '#334155']
    }
  ];

  // Available features
  const availableFeatures = [
    {
      id: 'members',
      name: 'Member Management',
      description: 'Manage club members, roles, and permissions',
      icon: '👥',
      required: true
    },
    {
      id: 'events',
      name: 'Event Management',
      description: 'Create and manage club events and activities',
      icon: '📅',
      required: false
    },
    {
      id: 'announcements',
      name: 'Announcements',
      description: 'Share important updates and news with members',
      icon: '📢',
      required: false
    },
    {
      id: 'attendance',
      name: 'Attendance Tracking',
      description: 'Track member attendance for events and meetings',
      icon: '✅',
      required: false
    }
  ];

  // Update club data
  const updateClubData = (field, value) => {
    setClubData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Set club type and auto-select default features
  const setClubType = (typeId) => {
    const selectedType = clubTypes.find(type => type.id === typeId);
    if (selectedType) {
      setClubData(prev => ({
        ...prev,
        clubType: typeId,
        features: [...selectedType.defaultFeatures]
      }));
    }
  };

  // Toggle feature selection
  const toggleFeature = (featureId) => {
    const feature = availableFeatures.find(f => f.id === featureId);
    if (feature?.required) return; // Can't toggle required features

    setClubData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  // Validation functions
  const canProceedFromStep = (step) => {
    switch (step) {
      case 1:
        return clubData.clubType !== '';
      case 2:
        return clubData.template !== '';
      case 3:
        return clubData.features.length > 0;
      case 4:
        return clubData.clubName.trim() !== '';
      default:
        return false;
    }
  };

  // Save club to Firestore
  const saveClub = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to create a club');
      return false;
    }

    try {
      const clubToSave = {
        ...clubData,
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'clubs'), clubToSave);
      
      toast.success('Club created successfully!');
      
      // Reset form
      resetForm();
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error('Failed to create club. Please try again.');
      return false;
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentStep(1);
    setClubData({
      clubType: '',
      template: '',
      features: [],
      clubName: '',
      tagline: '',
      logoUrl: '',
      themeColor: '#6366f1',
      status: 'pending'
    });
  };

  const value = {
    // State
    currentStep,
    clubData,
    clubTypes,
    templates,
    availableFeatures,
    
    // Actions
    updateClubData,
    setClubType,
    toggleFeature,
    nextStep,
    prevStep,
    goToStep,
    canProceedFromStep,
    saveClub,
    resetForm
  };

  return (
    <ClubCreationContext.Provider value={value}>
      {children}
    </ClubCreationContext.Provider>
  );
};
