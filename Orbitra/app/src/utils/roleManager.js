/**
 * Role Management Utilities
 * Helper functions to manage user roles for testing and development
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

/**
 * Set user role (for development/testing purposes)
 * @param {string} userId - User ID
 * @param {string} role - Role to set ('user', 'admin', 'superadmin')
 */
export const setUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: role,
      roleUpdatedAt: new Date().toISOString()
    });
    
    toast.success(`Role updated to ${role}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update role');
    return false;
  }
};

/**
 * Get user role
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} User role
 */
export const getUserRole = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Make current user superadmin (for development only)
 * @param {Object} currentUser - Current user object
 */
export const makeMeSuperadmin = async (currentUser) => {
  if (!currentUser) {
    toast.error('No user logged in');
    return false;
  }
  
  const success = await setUserRole(currentUser.uid, 'superadmin');
  if (success) {
    toast.success('You are now a superadmin! Please refresh the page.');
  }
  return success;
};

/**
 * Make current user admin (for development only)
 * @param {Object} currentUser - Current user object
 */
export const makeMeAdmin = async (currentUser) => {
  if (!currentUser) {
    toast.error('No user logged in');
    return false;
  }
  
  const success = await setUserRole(currentUser.uid, 'admin');
  if (success) {
    toast.success('You are now an admin! Please refresh the page.');
  }
  return success;
};

/**
 * Reset user role to default
 * @param {Object} currentUser - Current user object
 */
export const resetMyRole = async (currentUser) => {
  if (!currentUser) {
    toast.error('No user logged in');
    return false;
  }
  
  const success = await setUserRole(currentUser.uid, 'user');
  if (success) {
    toast.success('Role reset to user! Please refresh the page.');
  }
  return success;
};
