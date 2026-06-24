import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  getDoc,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useClubPublishing } from './ClubPublishingContext';

const ClubPortalContext = createContext();

export const useClubPortal = () => {
  const context = useContext(ClubPortalContext);
  if (!context) {
    throw new Error('useClubPortal must be used within a ClubPortalProvider');
  }
  return context;
};

export const ClubPortalProvider = ({ children, clubSlug }) => {
  const { currentUser } = useAuth();
  const { getClubBySlug } = useClubPublishing();
  
  const [club, setClub] = useState(null);
  const [userMembership, setUserMembership] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [clubAnnouncements, setClubAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load club data
  useEffect(() => {
    const loadClub = async () => {
      if (!clubSlug) {
        setError('Club not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const clubData = await getClubBySlug(clubSlug);
        
        if (!clubData) {
          setError('Club not found or not published');
          setLoading(false);
          return;
        }

        setClub(clubData);
        setError(null);
      } catch (err) {
        console.error('Error loading club:', err);
        setError('Failed to load club data');
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [clubSlug, getClubBySlug]);

  // Load user membership status
  useEffect(() => {
    if (!club?.id || !currentUser) {
      setUserMembership(null);
      return;
    }

    const memberDoc = doc(db, 'clubs', club.id, 'members', currentUser.uid);
    
    const unsubscribe = onSnapshot(memberDoc, (doc) => {
      if (doc.exists()) {
        setUserMembership({ id: doc.id, ...doc.data() });
      } else {
        setUserMembership(null);
      }
    }, (error) => {
      console.error('Error loading membership:', error);
      setUserMembership(null);
    });

    return () => unsubscribe();
  }, [club?.id, currentUser]);

  // Load club members (if user is a member)
  useEffect(() => {
    if (!club?.id || !userMembership) {
      setClubMembers([]);
      return;
    }

    const q = query(
      collection(db, 'clubs', club.id, 'members'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const members = [];
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
      // Sort by joinedAt on client side to avoid index requirement
      members.sort((a, b) => {
        const dateA = new Date(a.joinedAt || 0);
        const dateB = new Date(b.joinedAt || 0);
        return dateB - dateA;
      });
      setClubMembers(members);
    }, (error) => {
      console.error('Error loading members:', error);
      setClubMembers([]);
    });

    return () => unsubscribe();
  }, [club?.id, userMembership]);

  // Load club events (if user is a member)
  useEffect(() => {
    if (!club?.id || !userMembership) {
      setClubEvents([]);
      return;
    }

    const q = query(
      collection(db, 'clubs', club.id, 'events')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      // Sort by eventDate on client side to avoid index requirement
      events.sort((a, b) => {
        const dateA = new Date(a.eventDate || 0);
        const dateB = new Date(b.eventDate || 0);
        return dateB - dateA;
      });
      setClubEvents(events);
    }, (error) => {
      console.error('Error loading events:', error);
      setClubEvents([]);
    });

    return () => unsubscribe();
  }, [club?.id, userMembership]);

  // Load club announcements (if user is a member)
  useEffect(() => {
    if (!club?.id || !userMembership) {
      setClubAnnouncements([]);
      return;
    }

    const q = query(
      collection(db, 'clubs', club.id, 'announcements')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcements = [];
      querySnapshot.forEach((doc) => {
        announcements.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt on client side to avoid index requirement
      announcements.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setClubAnnouncements(announcements);
    }, (error) => {
      console.error('Error loading announcements:', error);
      setClubAnnouncements([]);
    });

    return () => unsubscribe();
  }, [club?.id, userMembership]);

  // Check if user has specific role
  const hasRole = (role) => {
    if (!userMembership) return false;
    
    const roleHierarchy = {
      'member': 0,
      'moderator': 1,
      'admin': 2,
      'owner': 3
    };

    const userLevel = roleHierarchy[userMembership.role] || 0;
    const requiredLevel = roleHierarchy[role] || 0;
    
    return userLevel >= requiredLevel;
  };

  // Check if user is club owner
  const isOwner = () => hasRole('owner');

  // Check if user is admin or owner
  const isAdmin = () => hasRole('admin');

  // Check if user is moderator or higher
  const isModerator = () => hasRole('moderator');

  // Check if user is a member
  const isMember = () => !!userMembership && userMembership.status === 'active';

  // Get club statistics
  const getClubStats = () => {
    const totalMembers = clubMembers.length;
    const upcomingEvents = clubEvents.filter(event => 
      new Date(event.eventDate) > new Date()
    ).length;
    const recentAnnouncements = clubAnnouncements.filter(announcement => {
      const announcementDate = new Date(announcement.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return announcementDate > weekAgo;
    }).length;

    return {
      totalMembers,
      upcomingEvents,
      recentAnnouncements,
      totalEvents: clubEvents.length,
      totalAnnouncements: clubAnnouncements.length
    };
  };

  // Get member role display
  const getMemberRoleDisplay = (role) => {
    const roleDisplays = {
      'owner': { label: 'Owner', color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20' },
      'admin': { label: 'Admin', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' },
      'moderator': { label: 'Moderator', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' },
      'member': { label: 'Member', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' }
    };

    return roleDisplays[role] || roleDisplays['member'];
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const value = {
    // Club data
    club,
    clubSlug,
    
    // User membership
    userMembership,
    isMember: isMember(),
    isOwner: isOwner(),
    isAdmin: isAdmin(),
    isModerator: isModerator(),
    
    // Club content
    clubMembers,
    clubEvents,
    clubAnnouncements,
    
    // State
    loading,
    error,
    
    // Utilities
    hasRole,
    getClubStats,
    getMemberRoleDisplay,
    formatDate,
    formatDateTime
  };

  return (
    <ClubPortalContext.Provider value={value}>
      {children}
    </ClubPortalContext.Provider>
  );
};
