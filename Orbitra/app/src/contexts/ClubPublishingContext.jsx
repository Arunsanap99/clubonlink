import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  getDocs,
  setDoc,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ClubPublishingContext = createContext();

export const useClubPublishing = () => {
  const context = useContext(ClubPublishingContext);
  if (!context) {
    throw new Error('useClubPublishing must be used within a ClubPublishingProvider');
  }
  return context;
};

export const ClubPublishingProvider = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  const [publishRequests, setPublishRequests] = useState([]);
  const [publishedClubs, setPublishedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Generate random string for unique identifier
  const generateRandomString = (length = 6) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Generate club slug from name
  const generateClubSlug = (clubName) => {
    return clubName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Check if route is available
  const isRouteAvailable = async (route) => {
    try {
      const clubsQuery = query(
        collection(db, 'clubs'),
        where('route', '==', route)
      );
      
      const snapshot = await getDocs(clubsQuery);
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking route availability:', error);
      return false;
    }
  };

  // Generate unique club route with format: /clubs/{clubSlug}-{randomId}
  const generateUniqueRoute = async (clubName) => {
    const baseSlug = generateClubSlug(clubName);
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomId = generateRandomString(6);
      const clubSlug = `${baseSlug}-${randomId}`;
      const route = `/clubs/${clubSlug}`;

      if (await isRouteAvailable(route)) {
        return { route, clubSlug };
      }
      attempts++;
    }

    // Fallback with timestamp if all attempts fail
    const timestamp = Date.now().toString().slice(-6);
    const clubSlug = `${baseSlug}-${timestamp}`;
    const route = `/clubs/${clubSlug}`;
    
    return { route, clubSlug };
  };

  // Fetch publish requests (Superadmin only)
  useEffect(() => {
    if (userRole !== 'superadmin') {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'publishRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setPublishRequests(requests);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching publish requests:', error);
      setPublishRequests([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userRole]);

  // Fetch published clubs
  useEffect(() => {
    const q = query(
      collection(db, 'clubs'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clubs = [];
      querySnapshot.forEach((doc) => {
        clubs.push({ id: doc.id, ...doc.data() });
      });
      // Sort by publishedAt on client side to avoid index requirement
      clubs.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0);
        const dateB = new Date(b.publishedAt || 0);
        return dateB - dateA;
      });
      setPublishedClubs(clubs);
    }, (error) => {
      console.error('Error fetching published clubs:', error);
      setPublishedClubs([]);
    });

    return () => unsubscribe();
  }, []);

  // Approve publish request
  const approvePublishRequest = async (request) => {
    console.log('Approving publish request:', request);
    console.log('Current user role:', userRole);
    
    if (userRole !== 'superadmin') {
      toast.error('Unauthorized action');
      return false;
    }

    setProcessing(true);
    try {
      // Get club data
      const clubDoc = await getDoc(doc(db, 'clubs', request.clubId));
      if (!clubDoc.exists()) {
        toast.error('Club not found');
        return false;
      }

      const clubData = clubDoc.data();
      
      // Generate unique route and slug
      const { route, clubSlug } = await generateUniqueRoute(clubData.clubName);
      
      // Update club status to published
      await updateDoc(doc(db, 'clubs', request.clubId), {
        status: 'published',
        route: route,
        clubSlug: clubSlug,
        publishedAt: new Date().toISOString(),
        publishedBy: currentUser.uid,
        lastUpdatedAt: new Date().toISOString()
      });

      // Create admin membership in club
      await setDoc(doc(db, 'clubs', request.clubId, 'members', clubData.adminId), {
        userId: clubData.adminId,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        addedBy: currentUser.uid,
        status: 'active'
      });

      // Update publish request status
      await updateDoc(doc(db, 'publishRequests', request.id), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.uid,
        clubSlug: clubSlug,
        clubRoute: route
      });

      // Create notification for admin
      await setDoc(doc(collection(db, 'notifications')), {
        userId: clubData.adminId,
        type: 'club_approved',
        title: 'Club Approved!',
        message: `Your club "${clubData.clubName}" has been approved and is now live at ${route}`,
        clubId: request.clubId,
        clubSlug: clubSlug,
        route: route,
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success(`Club "${clubData.clubName}" published successfully!`);
      return true;
    } catch (error) {
      console.error('Error approving publish request:', error);
      toast.error('Failed to approve publish request');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Reject publish request
  const rejectPublishRequest = async (request, reason = '') => {
    if (userRole !== 'superadmin') {
      toast.error('Unauthorized action');
      return false;
    }

    setProcessing(true);
    try {
      // Update club status back to pending
      await updateDoc(doc(db, 'clubs', request.clubId), {
        status: 'pending',
        lastUpdatedAt: new Date().toISOString()
      });

      // Update publish request status
      await updateDoc(doc(db, 'publishRequests', request.id), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser.uid,
        rejectionReason: reason
      });

      // Create notification for admin
      await setDoc(doc(collection(db, 'notifications')), {
        userId: request.adminId,
        type: 'club_rejected',
        title: 'Club Submission Rejected',
        message: `Your club "${request.clubName}" submission was rejected. ${reason ? `Reason: ${reason}` : 'Please review and resubmit.'}`,
        clubId: request.clubId,
        rejectionReason: reason,
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success('Publish request rejected');
      return true;
    } catch (error) {
      console.error('Error rejecting publish request:', error);
      toast.error('Failed to reject publish request');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Unpublish club (emergency action)
  const unpublishClub = async (clubId, reason = '') => {
    if (userRole !== 'superadmin') {
      toast.error('Unauthorized action');
      return false;
    }

    setProcessing(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId), {
        status: 'unpublished',
        unpublishedAt: new Date().toISOString(),
        unpublishedBy: currentUser.uid,
        unpublishReason: reason,
        lastUpdatedAt: new Date().toISOString()
      });

      toast.success('Club unpublished successfully');
      return true;
    } catch (error) {
      console.error('Error unpublishing club:', error);
      toast.error('Failed to unpublish club');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Get club by slug (for club portal access)
  const getClubBySlug = async (clubSlug) => {
    try {
      const route = `/clubs/${clubSlug}`;
      const q = query(
        collection(db, 'clubs'),
        where('route', '==', route),
        where('status', '==', 'published')
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching club by slug:', error);
      return null;
    }
  };

  // Get club statistics
  const getClubStats = () => {
    const totalClubs = publishedClubs.length;
    const pendingRequests = publishRequests.length;
    
    // Group by template
    const templateStats = publishedClubs.reduce((acc, club) => {
      acc[club.template] = (acc[club.template] || 0) + 1;
      return acc;
    }, {});

    // Group by club type
    const typeStats = publishedClubs.reduce((acc, club) => {
      acc[club.clubType] = (acc[club.clubType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalClubs,
      pendingRequests,
      templateStats,
      typeStats
    };
  };

  const value = {
    // State
    publishRequests,
    publishedClubs,
    loading,
    processing,
    
    // Actions
    approvePublishRequest,
    rejectPublishRequest,
    unpublishClub,
    getClubBySlug,
    generateUniqueRoute,
    
    // Utils
    getClubStats
  };

  return (
    <ClubPublishingContext.Provider value={value}>
      {children}
    </ClubPublishingContext.Provider>
  );
};
