import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query, 
  where,
  addDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const MemberManagementContext = createContext();

export const useMemberManagement = () => {
  const context = useContext(MemberManagementContext);
  if (!context) {
    throw new Error('useMemberManagement must be used within a MemberManagementProvider');
  }
  return context;
};

export const MemberManagementProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Generate random access key
  const generateAccessKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Create access key for club
  const createAccessKey = useCallback(async (clubId, options = {}) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return null;
    }

    setProcessing(true);
    try {
      // Verify user has admin access to club
      const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', currentUser.uid));
      if (!memberDoc.exists() || !['owner', 'admin'].includes(memberDoc.data().role)) {
        toast.error('Insufficient permissions');
        return null;
      }

      // Generate unique access key
      let accessKey;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        accessKey = generateAccessKey();
        
        // Check if key already exists
        const existingKeys = await getDocs(
          query(collection(db, 'accessKeys'), where('key', '==', accessKey))
        );
        
        if (existingKeys.empty) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        toast.error('Failed to generate unique access key');
        return null;
      }

      // Create access key document
      const accessKeyData = {
        key: accessKey,
        clubId: clubId,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        expiresAt: options.expiresAt || null,
        maxUses: options.maxUses || null,
        currentUses: 0,
        defaultRole: options.defaultRole || 'member',
        isActive: true,
        description: options.description || '',
        ...options
      };

      const keyDoc = await addDoc(collection(db, 'accessKeys'), accessKeyData);
      
      toast.success('Access key created successfully!');
      return { id: keyDoc.id, ...accessKeyData };
    } catch (error) {
      console.error('Error creating access key:', error);
      toast.error('Failed to create access key');
      return null;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Get club access keys
  const getClubAccessKeys = useCallback(async (clubId) => {
    if (!clubId) return [];

    setLoading(true);
    try {
      const keysQuery = query(
        collection(db, 'accessKeys'),
        where('clubId', '==', clubId)
      );
      
      const snapshot = await getDocs(keysQuery);
      const keys = [];
      
      snapshot.forEach((doc) => {
        keys.push({ id: doc.id, ...doc.data() });
      });

      // Sort by creation date (newest first)
      keys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return keys;
    } catch (error) {
      console.error('Error fetching access keys:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate and use access key
  const useAccessKey = useCallback(async (accessKey) => {
    if (!currentUser || !accessKey) {
      toast.error('Invalid access key or authentication required');
      return null;
    }

    setProcessing(true);
    try {
      // Find access key
      const keysQuery = query(
        collection(db, 'accessKeys'),
        where('key', '==', accessKey.toUpperCase()),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(keysQuery);
      
      if (snapshot.empty) {
        toast.error('Invalid or expired access key');
        return null;
      }

      const keyDoc = snapshot.docs[0];
      const keyData = keyDoc.data();

      // Check if key has expired
      if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
        toast.error('Access key has expired');
        return null;
      }

      // Check if key has reached max uses
      if (keyData.maxUses && keyData.currentUses >= keyData.maxUses) {
        toast.error('Access key has reached maximum uses');
        return null;
      }

      // Check if user is already a member
      const existingMember = await getDoc(
        doc(db, 'clubs', keyData.clubId, 'members', currentUser.uid)
      );
      
      if (existingMember.exists()) {
        toast.error('You are already a member of this club');
        return null;
      }

      // Get club data
      const clubDoc = await getDoc(doc(db, 'clubs', keyData.clubId));
      if (!clubDoc.exists()) {
        toast.error('Club not found');
        return null;
      }

      const clubData = clubDoc.data();

      // Add user as member
      await setDoc(doc(db, 'clubs', keyData.clubId, 'members', currentUser.uid), {
        userId: currentUser.uid,
        role: keyData.defaultRole,
        status: 'active',
        joinedAt: new Date().toISOString(),
        joinedVia: 'access_key',
        accessKeyId: keyDoc.id,
        addedBy: keyData.createdBy
      });

      // Update access key usage
      await updateDoc(keyDoc.ref, {
        currentUses: keyData.currentUses + 1,
        lastUsedAt: new Date().toISOString(),
        lastUsedBy: currentUser.uid
      });

      // Create notification for club admins
      await addDoc(collection(db, 'notifications'), {
        type: 'member_joined',
        clubId: keyData.clubId,
        clubName: clubData.clubName,
        userId: keyData.createdBy,
        title: 'New Member Joined',
        message: `${currentUser.displayName || currentUser.email} joined ${clubData.clubName}`,
        memberName: currentUser.displayName || currentUser.email,
        memberEmail: currentUser.email,
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success(`Successfully joined ${clubData.clubName}!`);
      return { club: clubData, role: keyData.defaultRole };
    } catch (error) {
      console.error('Error using access key:', error);
      toast.error('Failed to join club');
      return null;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Update access key
  const updateAccessKey = useCallback(async (keyId, updates) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return false;
    }

    setProcessing(true);
    try {
      await updateDoc(doc(db, 'accessKeys', keyId), {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid
      });

      toast.success('Access key updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating access key:', error);
      toast.error('Failed to update access key');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Deactivate access key
  const deactivateAccessKey = useCallback(async (keyId) => {
    return await updateAccessKey(keyId, { isActive: false });
  }, [updateAccessKey]);

  // Delete access key
  const deleteAccessKey = useCallback(async (keyId) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return false;
    }

    setProcessing(true);
    try {
      await deleteDoc(doc(db, 'accessKeys', keyId));
      toast.success('Access key deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting access key:', error);
      toast.error('Failed to delete access key');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Add member directly (admin function)
  const addMemberDirectly = useCallback(async (clubId, memberEmail, role = 'member') => {
    if (!currentUser) {
      toast.error('Authentication required');
      return false;
    }

    setProcessing(true);
    try {
      // Verify admin permissions
      const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', currentUser.uid));
      if (!memberDoc.exists() || !['owner', 'admin'].includes(memberDoc.data().role)) {
        toast.error('Insufficient permissions');
        return false;
      }

      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', memberEmail)
      );
      
      const userSnapshot = await getDocs(usersQuery);
      
      if (userSnapshot.empty) {
        toast.error('User not found with this email');
        return false;
      }

      const userData = userSnapshot.docs[0].data();
      const userId = userData.uid;

      // Check if already a member
      const existingMember = await getDoc(doc(db, 'clubs', clubId, 'members', userId));
      if (existingMember.exists()) {
        toast.error('User is already a member of this club');
        return false;
      }

      // Add as member
      await setDoc(doc(db, 'clubs', clubId, 'members', userId), {
        userId: userId,
        role: role,
        status: 'active',
        joinedAt: new Date().toISOString(),
        joinedVia: 'direct_add',
        addedBy: currentUser.uid
      });

      // Get club data for notification
      const clubDoc = await getDoc(doc(db, 'clubs', clubId));
      const clubData = clubDoc.data();

      // Create notification for new member
      await addDoc(collection(db, 'notifications'), {
        type: 'added_to_club',
        clubId: clubId,
        clubName: clubData.clubName,
        userId: userId,
        title: 'Added to Club',
        message: `You have been added to ${clubData.clubName} as a ${role}`,
        addedBy: currentUser.displayName || currentUser.email,
        role: role,
        read: false,
        createdAt: new Date().toISOString()
      });

      toast.success(`${memberEmail} added to club successfully!`);
      return true;
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Update member role
  const updateMemberRole = useCallback(async (clubId, memberId, newRole) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return false;
    }

    setProcessing(true);
    try {
      // Verify admin permissions
      const adminDoc = await getDoc(doc(db, 'clubs', clubId, 'members', currentUser.uid));
      if (!adminDoc.exists() || !['owner', 'admin'].includes(adminDoc.data().role)) {
        toast.error('Insufficient permissions');
        return false;
      }

      // Prevent demoting the owner
      const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', memberId));
      if (memberDoc.exists() && memberDoc.data().role === 'owner' && newRole !== 'owner') {
        toast.error('Cannot change owner role');
        return false;
      }

      // Update member role
      await updateDoc(doc(db, 'clubs', clubId, 'members', memberId), {
        role: newRole,
        roleUpdatedAt: new Date().toISOString(),
        roleUpdatedBy: currentUser.uid
      });

      toast.success('Member role updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Remove member
  const removeMember = useCallback(async (clubId, memberId) => {
    if (!currentUser) {
      toast.error('Authentication required');
      return false;
    }

    setProcessing(true);
    try {
      // Verify admin permissions
      const adminDoc = await getDoc(doc(db, 'clubs', clubId, 'members', currentUser.uid));
      if (!adminDoc.exists() || !['owner', 'admin'].includes(adminDoc.data().role)) {
        toast.error('Insufficient permissions');
        return false;
      }

      // Prevent removing the owner
      const memberDoc = await getDoc(doc(db, 'clubs', clubId, 'members', memberId));
      if (memberDoc.exists() && memberDoc.data().role === 'owner') {
        toast.error('Cannot remove club owner');
        return false;
      }

      // Remove member
      await deleteDoc(doc(db, 'clubs', clubId, 'members', memberId));

      toast.success('Member removed successfully!');
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      return false;
    } finally {
      setProcessing(false);
    }
  }, [currentUser]);

  // Generate invitation link
  const generateInvitationLink = useCallback(async (clubId, options = {}) => {
    const accessKeyData = await createAccessKey(clubId, options);
    if (!accessKeyData) return null;

    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/join/${accessKeyData.key}`;
    
    return {
      link: inviteLink,
      accessKey: accessKeyData.key,
      ...accessKeyData
    };
  }, [createAccessKey]);

  const value = {
    // State
    loading,
    processing,
    
    // Access Key Management
    createAccessKey,
    getClubAccessKeys,
    useAccessKey,
    updateAccessKey,
    deactivateAccessKey,
    deleteAccessKey,
    
    // Member Management
    addMemberDirectly,
    updateMemberRole,
    removeMember,
    
    // Invitation System
    generateInvitationLink,
    
    // Utilities
    generateAccessKey: () => generateAccessKey()
  };

  return (
    <MemberManagementContext.Provider value={value}>
      {children}
    </MemberManagementContext.Provider>
  );
};
