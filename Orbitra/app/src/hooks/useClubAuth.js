import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useClubAuth = (clubId, clubSlug) => {
  const { currentUser } = useAuth();
  const [clubMembership, setClubMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Check club membership
  const checkMembership = useCallback(async (userId = null) => {
    const uid = userId || currentUser?.uid;
    if (!uid || !clubId) {
      setClubMembership(null);
      setLoading(false);
      return null;
    }

    try {
      const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', uid));
      if (memberDoc.exists()) {
        const memberData = { id: memberDoc.id, ...memberDoc.data() };
        setClubMembership(memberData);
        return memberData;
      } else {
        setClubMembership(null);
        return null;
      }
    } catch (error) {
      console.error('Error checking membership:', error);
      setClubMembership(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, clubId]);

  // Load membership on mount and user change
  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  // Club-specific signup
  const clubSignup = useCallback(async (email, password, displayName, accessKey = null) => {
    setProcessing(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName });

      // Create global user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: displayName,
        email: email,
        profilePictureURL: '',
        role: 'user',
        createdAt: new Date().toISOString(),
        clubs: [clubId] // Track club memberships
      });

      // Join club (either with access key or as pending)
      if (accessKey) {
        const joinResult = await joinWithAccessKey(accessKey, user.uid);
        if (!joinResult.success) {
          throw new Error(joinResult.error);
        }
      } else {
        // Create pending membership
        await setDoc(doc(db, 'clubs', clubId, 'members', user.uid), {
          userId: user.uid,
          name: displayName,
          email: email,
          role: 'pending',
          status: 'pending',
          joinedAt: new Date().toISOString(),
          joinedVia: 'signup',
          profileURL: ''
        });
      }

      toast.success('Account created successfully!');
      await checkMembership(user.uid);
      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  }, [clubId, checkMembership]);

  // Club-specific login
  const clubLogin = useCallback(async (email, password) => {
    setProcessing(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user exists in global users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || email.split('@')[0],
          email: email,
          profilePictureURL: user.photoURL || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          clubs: []
        });
      }

      toast.success('Signed in successfully!');
      await checkMembership(user.uid);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  }, [checkMembership]);

  // Google OAuth for club
  const clubGoogleAuth = useCallback(async (accessKey = null) => {
    setProcessing(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in global users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isNewUser = !userDoc.exists();

      if (isNewUser) {
        // Create user document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePictureURL: user.photoURL || '',
          role: 'user',
          createdAt: new Date().toISOString(),
          clubs: [clubId]
        });
      }

      // Check existing membership
      const existingMembership = await checkMembership(user.uid);
      
      if (!existingMembership) {
        // Join club
        if (accessKey) {
          const joinResult = await joinWithAccessKey(accessKey, user.uid);
          if (!joinResult.success) {
            throw new Error(joinResult.error);
          }
        } else {
          // Create pending membership
          await setDoc(doc(db, 'clubs', clubId, 'members', user.uid), {
            userId: user.uid,
            name: user.displayName,
            email: user.email,
            role: 'pending',
            status: 'pending',
            joinedAt: new Date().toISOString(),
            joinedVia: 'google',
            profileURL: user.photoURL || ''
          });
        }
      }

      toast.success(isNewUser ? 'Account created successfully!' : 'Signed in successfully!');
      await checkMembership(user.uid);
      return { success: true, user, isNewUser };
    } catch (error) {
      console.error('Google auth error:', error);
      
      // Handle popup closed by user - this is not an error, just user cancellation
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Google sign-in popup was closed by user');
        return { success: false, cancelled: true };
      }
      
      toast.error(error.message || 'Failed to authenticate with Google');
      return { success: false, error: error.message };
    } finally {
      setProcessing(false);
    }
  }, [clubId, checkMembership]);

  // Join with access key
  const joinWithAccessKey = useCallback(async (accessKey, userId = null) => {
    const uid = userId || currentUser?.uid;
    if (!uid) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Use Firestore transaction for safe key consumption
      const result = await runTransaction(db, async (transaction) => {
        // Find access key
        const keysQuery = query(
          collection(db, 'clubs', clubId, 'accessKeys'),
          where('keyValue', '==', accessKey.toUpperCase()),
          where('isActive', '==', true)
        );
        
        const keySnapshot = await getDocs(keysQuery);
        
        if (keySnapshot.empty) {
          throw new Error('Invalid or expired access key');
        }

        const keyDoc = keySnapshot.docs[0];
        const keyData = keyDoc.data();

        // Check expiration
        if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
          throw new Error('Access key has expired');
        }

        // Check uses left
        if (keyData.usesLeft !== null && keyData.usesLeft <= 0) {
          throw new Error('Access key has no uses remaining');
        }

        // Check if already a member
        const memberRef = doc(db, 'clubs', clubId, 'members', uid);
        const memberDoc = await transaction.get(memberRef);
        
        if (memberDoc.exists()) {
          throw new Error('Already a member of this club');
        }

        // Get user data
        const userRef = doc(db, 'users', uid);
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();

        // Add member
        transaction.set(memberRef, {
          userId: uid,
          name: userData.name,
          email: userData.email,
          role: keyData.defaultRole || 'member',
          status: 'active',
          joinedAt: new Date().toISOString(),
          joinedVia: 'access_key',
          accessKeyId: keyDoc.id,
          profileURL: userData.profilePictureURL || ''
        });

        // Update access key usage
        const updates = {
          lastUsedAt: new Date().toISOString(),
          lastUsedBy: uid
        };

        if (keyData.usesLeft !== null) {
          updates.usesLeft = keyData.usesLeft - 1;
          if (updates.usesLeft <= 0) {
            updates.isActive = false;
          }
        }

        transaction.update(keyDoc.ref, updates);

        // Update user's clubs array
        transaction.update(userRef, {
          clubs: [...(userData.clubs || []), clubId]
        });

        // Create audit log
        const logRef = doc(collection(db, 'clubs', clubId, 'logs'));
        transaction.set(logRef, {
          type: 'member_joined',
          userId: uid,
          userName: userData.name,
          userEmail: userData.email,
          accessKeyId: keyDoc.id,
          role: keyData.defaultRole || 'member',
          timestamp: new Date().toISOString(),
          details: 'Joined via access key'
        });

        return { 
          success: true, 
          role: keyData.defaultRole || 'member',
          keyData 
        };
      });

      toast.success('Successfully joined the club!');
      await checkMembership(uid);
      return result;
    } catch (error) {
      console.error('Error joining with access key:', error);
      return { success: false, error: error.message };
    }
  }, [clubId, currentUser, checkMembership]);

  // Check if user has specific role
  const hasRole = useCallback((requiredRole) => {
    if (!clubMembership) return false;
    
    const roleHierarchy = {
      'member': 0,
      'moderator': 1,
      'admin': 2,
      'owner': 3
    };

    const userLevel = roleHierarchy[clubMembership.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }, [clubMembership]);

  // Check if user is club member
  const isMember = useCallback(() => {
    return clubMembership && clubMembership.status === 'active';
  }, [clubMembership]);

  return {
    // State
    clubMembership,
    loading,
    processing,
    
    // Auth methods
    clubSignup,
    clubLogin,
    clubGoogleAuth,
    joinWithAccessKey,
    
    // Membership checks
    checkMembership,
    hasRole,
    isMember,
    
    // Utilities
    isOwner: () => hasRole('owner'),
    isAdmin: () => hasRole('admin'),
    isModerator: () => hasRole('moderator')
  };
};
