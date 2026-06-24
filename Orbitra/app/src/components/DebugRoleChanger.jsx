import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DebugRoleChanger = () => {
  const { currentUser, refreshUserData } = useAuth();

  const changeRole = async (role) => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        role: role
      });
      
      await refreshUserData();
      toast.success(`Role changed to ${role}`);
    } catch (error) {
      toast.error('Failed to change role');
      console.error(error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-bold mb-2">Debug: Change Role</h3>
      <div className="space-x-2">
        <button 
          onClick={() => changeRole('user')}
          className="px-3 py-1 bg-gray-500 text-white rounded text-xs"
        >
          User
        </button>
        <button 
          onClick={() => changeRole('admin')}
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Admin
        </button>
        <button 
          onClick={() => changeRole('superadmin')}
          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
        >
          Superadmin
        </button>
      </div>
    </div>
  );
};

export default DebugRoleChanger;