import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signUp = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        profilePictureURL: user.photoURL || '',
        role: 'user', // Default role
        createdAt: new Date().toISOString()
      });
      
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      return userCredential.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profilePictureURL: user.photoURL || '',
          role: 'user', // Default role
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success('Signed in with Google successfully!');
      return user;
    } catch (error) {
      // Handle popup closed by user - this is not an error, just user cancellation
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Google sign-in popup was closed by user');
        return null;
      }
      
      // Handle other errors
      toast.error(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Request admin role
  const requestAdminRole = async () => {
    if (!currentUser) return;
    
    try {
      const requestId = `${currentUser.uid}_${Date.now()}`;
      await setDoc(doc(db, 'adminRequests', requestId), {
        requestId,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Unknown',
        userEmail: currentUser.email,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
      
      toast.success('Admin access request submitted!');
    } catch (error) {
      toast.error('Failed to submit admin request');
      throw error;
    }
  };


  // Fetch user role and data
  const fetchUserData = async (user) => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh user data (useful after role changes)
  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  const value = {
    currentUser,
    userRole,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    requestAdminRole,
    fetchUserData,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
