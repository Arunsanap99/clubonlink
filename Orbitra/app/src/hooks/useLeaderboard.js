import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  writeBatch,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

/**
 * Hook for managing club leaderboards and scoring
 * @param {string} clubId - Club ID
 * @param {string} boardId - Leaderboard ID (optional)
 * @param {Object} options - Configuration options
 */
export const useLeaderboard = (clubId, boardId = null, options = {}) => {
  const {
    topN = 50, // Number of top entries to fetch
    realtime = true,
    includeTeams = false
  } = options;

  const [leaderboards, setLeaderboards] = useState([]);
  const [entries, setEntries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load leaderboards
  useEffect(() => {
    if (!clubId) return;

    const leaderboardsRef = collection(db, 'clubs', clubId, 'leaderboards');
    const leaderboardsQuery = query(leaderboardsRef, orderBy('createdAt', 'desc'));

    if (realtime) {
      const unsubscribe = onSnapshot(
        leaderboardsQuery,
        (snapshot) => {
          const boardsData = [];
          snapshot.forEach((doc) => {
            boardsData.push({ id: doc.id, ...doc.data() });
          });
          setLeaderboards(boardsData);
        },
        (err) => {
          console.error('Error loading leaderboards:', err);
          setError(err.message);
        }
      );

      return () => unsubscribe();
    } else {
      getDocs(leaderboardsQuery)
        .then((snapshot) => {
          const boardsData = [];
          snapshot.forEach((doc) => {
            boardsData.push({ id: doc.id, ...doc.data() });
          });
          setLeaderboards(boardsData);
        })
        .catch((err) => {
          console.error('Error loading leaderboards:', err);
          setError(err.message);
        });
    }
  }, [clubId, realtime]);

  // Load entries for specific leaderboard
  useEffect(() => {
    if (!clubId || !boardId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const entriesRef = collection(db, 'clubs', clubId, 'leaderboards', boardId, 'entries');
    const entriesQuery = query(entriesRef, orderBy('rank', 'asc'), limit(topN));

    if (realtime) {
      const unsubscribe = onSnapshot(
        entriesQuery,
        (snapshot) => {
          const entriesData = [];
          snapshot.forEach((doc) => {
            entriesData.push({ id: doc.id, ...doc.data() });
          });
          setEntries(entriesData);
          setLoading(false);
        },
        (err) => {
          console.error('Error loading entries:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      getDocs(entriesQuery)
        .then((snapshot) => {
          const entriesData = [];
          snapshot.forEach((doc) => {
            entriesData.push({ id: doc.id, ...doc.data() });
          });
          setEntries(entriesData);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading entries:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [clubId, boardId, topN, realtime]);

  // Load teams if needed
  useEffect(() => {
    if (!clubId || !includeTeams) return;

    const teamsRef = collection(db, 'clubs', clubId, 'teams');
    const teamsQuery = query(teamsRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      teamsQuery,
      (snapshot) => {
        const teamsData = [];
        snapshot.forEach((doc) => {
          teamsData.push({ id: doc.id, ...doc.data() });
        });
        setTeams(teamsData);
      },
      (err) => {
        console.error('Error loading teams:', err);
      }
    );

    return () => unsubscribe();
  }, [clubId, includeTeams]);

  // Create leaderboard
  const createLeaderboard = useCallback(async (boardData, createdBy) => {
    if (!clubId) throw new Error('Club ID is required');

    try {
      const leaderboardsRef = collection(db, 'clubs', clubId, 'leaderboards');
      const newBoard = {
        ...boardData,
        createdBy,
        createdAt: new Date().toISOString(),
        entryCount: 0,
        lastUpdated: new Date().toISOString()
      };

      const docRef = await addDoc(leaderboardsRef, newBoard);
      toast.success('Leaderboard created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating leaderboard:', error);
      toast.error('Failed to create leaderboard');
      throw error;
    }
  }, [clubId]);

  // Update score (transaction-safe)
  const updateScore = useCallback(async (boardId, entityId, scoreChange, updatedBy, entityData = {}) => {
    if (!clubId || !boardId || !entityId) {
      throw new Error('Club ID, Board ID, and Entity ID are required');
    }

    try {
      const result = await runTransaction(db, async (transaction) => {
        const entryRef = doc(db, 'clubs', clubId, 'leaderboards', boardId, 'entries', entityId);
        const boardRef = doc(db, 'clubs', clubId, 'leaderboards', boardId);
        
        const entryDoc = await transaction.get(entryRef);
        const boardDoc = await transaction.get(boardRef);
        
        if (!boardDoc.exists()) {
          throw new Error('Leaderboard not found');
        }

        const boardData = boardDoc.data();
        let newScore = scoreChange;
        let isNewEntry = false;

        if (entryDoc.exists()) {
          // Update existing entry
          const currentScore = entryDoc.data().score || 0;
          newScore = currentScore + scoreChange;
        } else {
          // Create new entry
          isNewEntry = true;
        }

        const entryData = {
          entityId,
          name: entityData.name || 'Unknown',
          score: newScore,
          lastUpdated: new Date().toISOString(),
          updatedBy,
          ...entityData
        };

        transaction.set(entryRef, entryData);

        // Update board metadata
        const updates = {
          lastUpdated: new Date().toISOString()
        };

        if (isNewEntry) {
          updates.entryCount = (boardData.entryCount || 0) + 1;
        }

        transaction.update(boardRef, updates);

        return { newScore, isNewEntry };
      });

      // Recompute ranks after score update
      await recomputeRanks(boardId);

      toast.success(`Score updated successfully`);
      return result;
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
      throw error;
    }
  }, [clubId]);

  // Recompute ranks for all entries in a leaderboard
  const recomputeRanks = useCallback(async (boardId) => {
    if (!clubId || !boardId) return;

    try {
      // Get all entries sorted by score
      const entriesRef = collection(db, 'clubs', clubId, 'leaderboards', boardId, 'entries');
      const entriesQuery = query(entriesRef, orderBy('score', 'desc'));
      const snapshot = await getDocs(entriesQuery);

      const batch = writeBatch(db);
      let currentRank = 1;
      let previousScore = null;
      let actualRank = 1;

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Handle ties - same score gets same rank
        if (previousScore !== null && data.score < previousScore) {
          currentRank = actualRank;
        }
        
        batch.update(doc.ref, { rank: currentRank });
        
        previousScore = data.score;
        actualRank++;
      });

      await batch.commit();
    } catch (error) {
      console.error('Error recomputing ranks:', error);
    }
  }, [clubId]);

  // Bulk update scores (for importing data or batch operations)
  const bulkUpdateScores = useCallback(async (boardId, updates, updatedBy) => {
    if (!clubId || !boardId || !updates.length) return;

    try {
      const batch = writeBatch(db);
      const boardRef = doc(db, 'clubs', clubId, 'leaderboards', boardId);

      updates.forEach(({ entityId, score, entityData = {} }) => {
        const entryRef = doc(db, 'clubs', clubId, 'leaderboards', boardId, 'entries', entityId);
        
        batch.set(entryRef, {
          entityId,
          score,
          name: entityData.name || 'Unknown',
          lastUpdated: new Date().toISOString(),
          updatedBy,
          ...entityData
        });
      });

      // Update board metadata
      batch.update(boardRef, {
        lastUpdated: new Date().toISOString(),
        entryCount: updates.length
      });

      await batch.commit();
      
      // Recompute ranks
      await recomputeRanks(boardId);
      
      toast.success(`Updated ${updates.length} entries`);
    } catch (error) {
      console.error('Error bulk updating scores:', error);
      toast.error('Failed to bulk update scores');
      throw error;
    }
  }, [clubId, recomputeRanks]);

  // Reset leaderboard (seasonal reset)
  const resetLeaderboard = useCallback(async (boardId, archiveName = null) => {
    if (!clubId || !boardId) throw new Error('Club ID and Board ID are required');

    try {
      const entriesRef = collection(db, 'clubs', clubId, 'leaderboards', boardId, 'entries');
      const snapshot = await getDocs(entriesRef);

      // Archive current data if requested
      if (archiveName) {
        const archiveRef = collection(db, 'clubs', clubId, 'leaderboards', boardId, 'archives');
        const archiveDoc = doc(archiveRef, archiveName);
        
        const archiveData = {
          name: archiveName,
          createdAt: new Date().toISOString(),
          entries: []
        };

        snapshot.forEach((doc) => {
          archiveData.entries.push({ id: doc.id, ...doc.data() });
        });

        await addDoc(archiveRef, archiveData);
      }

      // Delete all entries
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Reset board metadata
      const boardRef = doc(db, 'clubs', clubId, 'leaderboards', boardId);
      batch.update(boardRef, {
        entryCount: 0,
        lastUpdated: new Date().toISOString(),
        lastReset: new Date().toISOString()
      });

      await batch.commit();
      toast.success('Leaderboard reset successfully');
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
      toast.error('Failed to reset leaderboard');
      throw error;
    }
  }, [clubId]);

  // Delete leaderboard
  const deleteLeaderboard = useCallback(async (boardId) => {
    if (!clubId || !boardId) throw new Error('Club ID and Board ID are required');

    try {
      // Delete all entries first
      const entriesRef = collection(db, 'clubs', clubId, 'leaderboards', boardId, 'entries');
      const entriesSnapshot = await getDocs(entriesRef);

      const batch = writeBatch(db);
      entriesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete archives if any
      const archivesRef = collection(db, 'clubs', clubId, 'leaderboards', boardId, 'archives');
      const archivesSnapshot = await getDocs(archivesRef);
      archivesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete the leaderboard
      const boardRef = doc(db, 'clubs', clubId, 'leaderboards', boardId);
      batch.delete(boardRef);

      await batch.commit();
      toast.success('Leaderboard deleted successfully');
    } catch (error) {
      console.error('Error deleting leaderboard:', error);
      toast.error('Failed to delete leaderboard');
      throw error;
    }
  }, [clubId]);

  // Get entry by entity ID
  const getEntry = useCallback((entityId) => {
    return entries.find(entry => entry.entityId === entityId);
  }, [entries]);

  // Get top N entries
  const getTopEntries = useCallback((n = 10) => {
    return entries.slice(0, n);
  }, [entries]);

  // Search entries
  const searchEntries = useCallback((searchTerm) => {
    if (!searchTerm) return entries;
    
    return entries.filter(entry =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [entries]);

  return {
    // Data
    leaderboards,
    entries,
    teams,
    loading,
    error,
    
    // Actions
    createLeaderboard,
    updateScore,
    bulkUpdateScores,
    resetLeaderboard,
    deleteLeaderboard,
    recomputeRanks,
    
    // Utilities
    getEntry,
    getTopEntries,
    searchEntries,
    
    // Computed
    totalEntries: entries.length,
    currentBoard: leaderboards.find(board => board.id === boardId),
    topThree: entries.slice(0, 3)
  };
};
