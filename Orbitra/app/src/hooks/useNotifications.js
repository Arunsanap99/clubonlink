import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

// FCM configuration
const VAPID_KEY = process.env.REACT_APP_FCM_VAPID_KEY;

/**
 * Hook for managing notifications and FCM integration
 * @param {string} userId - Current user ID
 * @param {string} clubId - Club ID (optional)
 * @param {Object} options - Configuration options
 */
export const useNotifications = (userId, clubId = null, options = {}) => {
  const {
    maxNotifications = 50,
    realtime = true,
    enableFCM = true
  } = options;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [messaging, setMessaging] = useState(null);

  // Initialize FCM
  useEffect(() => {
    if (!enableFCM || !userId) return;

    const initializeFCM = async () => {
      try {
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          console.warn('Service Worker not supported');
          return;
        }

        // Initialize messaging
        const messagingInstance = getMessaging();
        setMessaging(messagingInstance);

        // Request permission and get token
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messagingInstance, {
            vapidKey: VAPID_KEY
          });
          
          if (token) {
            setFcmToken(token);
            await saveFCMToken(token);
          }
        }

        // Listen for foreground messages
        onMessage(messagingInstance, (payload) => {
          console.log('Foreground message received:', payload);
          
          // Show toast notification
          toast.success(payload.notification?.title || 'New notification', {
            description: payload.notification?.body
          });

          // Refresh notifications
          refreshNotifications();
        });

      } catch (error) {
        console.error('FCM initialization error:', error);
      }
    };

    initializeFCM();
  }, [userId, enableFCM]);

  // Save FCM token to Firestore
  const saveFCMToken = useCallback(async (token) => {
    if (!userId || !token) return;

    try {
      const tokensRef = collection(db, 'users', userId, 'fcmTokens');
      await addDoc(tokensRef, {
        token,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        userAgent: navigator.userAgent,
        active: true
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }, [userId]);

  // Load user's inbox notifications
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const inboxRef = collection(db, 'users', userId, 'inbox');
    let inboxQuery = query(
      inboxRef, 
      orderBy('createdAt', 'desc'), 
      limit(maxNotifications)
    );

    // Filter by club if specified
    if (clubId) {
      inboxQuery = query(inboxQuery, where('clubId', '==', clubId));
    }

    if (realtime) {
      const unsubscribe = onSnapshot(
        inboxQuery,
        (snapshot) => {
          const notificationsData = [];
          let unread = 0;

          snapshot.forEach((doc) => {
            const notification = { id: doc.id, ...doc.data() };
            notificationsData.push(notification);
            
            if (!notification.read) {
              unread++;
            }
          });

          setNotifications(notificationsData);
          setUnreadCount(unread);
          setLoading(false);
        },
        (err) => {
          console.error('Error loading notifications:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      getDocs(inboxQuery)
        .then((snapshot) => {
          const notificationsData = [];
          let unread = 0;

          snapshot.forEach((doc) => {
            const notification = { id: doc.id, ...doc.data() };
            notificationsData.push(notification);
            
            if (!notification.read) {
              unread++;
            }
          });

          setNotifications(notificationsData);
          setUnreadCount(unread);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading notifications:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [userId, clubId, maxNotifications, realtime]);

  // Create notification (admin only)
  const createNotification = useCallback(async (notificationData, createdBy) => {
    if (!clubId) throw new Error('Club ID is required');

    try {
      // Create club notification
      const clubNotificationsRef = collection(db, 'clubs', clubId, 'notifications');
      const notification = {
        ...notificationData,
        createdBy,
        createdAt: new Date().toISOString(),
        clubId
      };

      const docRef = await addDoc(clubNotificationsRef, notification);

      // Note: In production, this would trigger a Cloud Function to:
      // 1. Find target users based on notification.target
      // 2. Send FCM push notifications
      // 3. Create inbox entries for each user
      
      // For client-only implementation, we'll create inbox entries directly
      await createInboxEntries(notification, docRef.id);

      toast.success('Notification sent successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to send notification');
      throw error;
    }
  }, [clubId]);

  // Create inbox entries for notification (client-side fallback)
  const createInboxEntries = useCallback(async (notification, notificationId) => {
    if (!clubId) return;

    try {
      // Get target users based on notification.target
      let targetUsers = [];
      
      if (notification.target === 'all') {
        // Get all club members
        const membersRef = collection(db, 'clubs', clubId, 'members');
        const membersSnapshot = await getDocs(membersRef);
        targetUsers = membersSnapshot.docs.map(doc => doc.id);
      } else if (notification.target.startsWith('role:')) {
        // Get users with specific role
        const role = notification.target.split(':')[1];
        const membersRef = collection(db, 'clubs', clubId, 'members');
        const roleQuery = query(membersRef, where('role', '==', role));
        const roleSnapshot = await getDocs(roleQuery);
        targetUsers = roleSnapshot.docs.map(doc => doc.id);
      } else if (notification.target.startsWith('uid:')) {
        // Specific user
        targetUsers = [notification.target.split(':')[1]];
      }

      // Create inbox entries in batches
      const batch = writeBatch(db);
      const batchSize = 500; // Firestore batch limit

      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const userBatch = targetUsers.slice(i, i + batchSize);
        
        userBatch.forEach(userId => {
          const inboxRef = doc(collection(db, 'users', userId, 'inbox'));
          batch.set(inboxRef, {
            ...notification,
            notificationId,
            read: false,
            readAt: null
          });
        });

        await batch.commit();
      }
    } catch (error) {
      console.error('Error creating inbox entries:', error);
    }
  }, [clubId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!userId || !notificationId) return;

    try {
      const inboxRef = doc(db, 'users', userId, 'inbox', notificationId);
      await updateDoc(inboxRef, {
        read: true,
        readAt: new Date().toISOString()
      });

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);

      unreadNotifications.forEach(notification => {
        const inboxRef = doc(db, 'users', userId, 'inbox', notification.id);
        batch.update(inboxRef, {
          read: true,
          readAt: new Date().toISOString()
        });
      });

      await batch.commit();

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          read: true, 
          readAt: new Date().toISOString() 
        }))
      );
      
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [userId, notifications, unreadCount]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const inboxRef = collection(db, 'users', userId, 'inbox');
      let inboxQuery = query(
        inboxRef, 
        orderBy('createdAt', 'desc'), 
        limit(maxNotifications)
      );

      if (clubId) {
        inboxQuery = query(inboxQuery, where('clubId', '==', clubId));
      }

      const snapshot = await getDocs(inboxQuery);
      const notificationsData = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() };
        notificationsData.push(notification);
        
        if (!notification.read) {
          unread++;
        }
      });

      setNotifications(notificationsData);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [userId, clubId, maxNotifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return notifications.filter(notification => 
      new Date(notification.createdAt) > yesterday
    );
  }, [notifications]);

  return {
    // Data
    notifications,
    unreadCount,
    loading,
    error,
    fcmToken,
    
    // Actions
    createNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    
    // Utilities
    getNotificationsByType,
    getRecentNotifications,
    
    // Computed
    hasUnread: unreadCount > 0,
    recentNotifications: getRecentNotifications()
  };
};

/**
 * Cloud Function example for server-side notification handling
 * 
 * exports.sendClubNotification = functions.firestore
 *   .document('clubs/{clubId}/notifications/{notificationId}')
 *   .onCreate(async (snap, context) => {
 *     const { clubId, notificationId } = context.params;
 *     const notification = snap.data();
 *     
 *     // Get target users
 *     let targetUsers = [];
 *     if (notification.target === 'all') {
 *       const membersSnapshot = await admin.firestore()
 *         .collection(`clubs/${clubId}/members`)
 *         .get();
 *       targetUsers = membersSnapshot.docs.map(doc => doc.id);
 *     }
 *     // ... handle other target types
 *     
 *     // Get FCM tokens for target users
 *     const tokens = [];
 *     for (const userId of targetUsers) {
 *       const tokensSnapshot = await admin.firestore()
 *         .collection(`users/${userId}/fcmTokens`)
 *         .where('active', '==', true)
 *         .get();
 *       
 *       tokensSnapshot.docs.forEach(doc => {
 *         tokens.push(doc.data().token);
 *       });
 *     }
 *     
 *     // Send FCM messages
 *     if (tokens.length > 0) {
 *       const message = {
 *         notification: {
 *           title: notification.title,
 *           body: notification.body
 *         },
 *         data: notification.data || {},
 *         tokens
 *       };
 *       
 *       await admin.messaging().sendMulticast(message);
 *     }
 *     
 *     // Create inbox entries
 *     const batch = admin.firestore().batch();
 *     targetUsers.forEach(userId => {
 *       const inboxRef = admin.firestore()
 *         .collection(`users/${userId}/inbox`)
 *         .doc();
 *       
 *       batch.set(inboxRef, {
 *         ...notification,
 *         notificationId,
 *         read: false,
 *         readAt: null
 *       });
 *     });
 *     
 *     await batch.commit();
 *   });
 */
