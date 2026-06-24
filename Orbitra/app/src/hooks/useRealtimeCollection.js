import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  where, 
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generic hook for real-time Firestore collection listening
 * @param {string} path - Firestore collection path
 * @param {Object} options - Query options
 * @param {Array} options.orderByFields - Array of [field, direction] pairs
 * @param {Array} options.whereFilters - Array of [field, operator, value] triplets
 * @param {number} options.limitCount - Limit number of documents
 * @param {boolean} options.realtime - Enable real-time updates (default: true)
 * @param {boolean} options.enabled - Enable the query (default: true)
 */
export const useRealtimeCollection = (path, options = {}) => {
  const {
    orderByFields = [],
    whereFilters = [],
    limitCount = null,
    realtime = true,
    enabled = true
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Build Firestore query
  const buildQuery = useCallback(() => {
    if (!path || !enabled) return null;

    try {
      let q = collection(db, path);

      // Apply where filters
      whereFilters.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });

      // Apply ordering
      orderByFields.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      return q;
    } catch (err) {
      console.error('Error building query:', err);
      setError(err.message);
      return null;
    }
  }, [path, whereFilters, orderByFields, limitCount, enabled]);

  // Set up real-time listener or one-time fetch
  useEffect(() => {
    const q = buildQuery();
    if (!q) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (realtime) {
      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents = [];
          snapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          setData(documents);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // One-time fetch
      getDocs(q)
        .then((snapshot) => {
          const documents = [];
          snapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
          });
          setData(documents);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Firestore fetch error:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [buildQuery, realtime]);

  // Refresh function for manual updates
  const refresh = useCallback(async () => {
    const q = buildQuery();
    if (!q) return;

    try {
      setLoading(true);
      const snapshot = await getDocs(q);
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      setData(documents);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  return {
    data,
    loading,
    error,
    refresh,
    isEmpty: data.length === 0 && !loading
  };
};

/**
 * Hook for paginated real-time collection
 * @param {string} path - Firestore collection path
 * @param {Object} options - Query options with pagination
 */
export const usePaginatedCollection = (path, options = {}) => {
  const { pageSize = 20, ...queryOptions } = options;
  const [allData, setAllData] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    data: currentPage,
    loading: initialLoading,
    error
  } = useRealtimeCollection(path, {
    ...queryOptions,
    limitCount: pageSize,
    realtime: false // Use one-time fetch for pagination
  });

  // Load initial page
  useEffect(() => {
    if (currentPage.length > 0 && allData.length === 0) {
      setAllData(currentPage);
      setLastDoc(currentPage[currentPage.length - 1]);
      setHasMore(currentPage.length === pageSize);
    }
  }, [currentPage, allData.length, pageSize]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      let q = collection(db, path);

      // Apply filters and ordering
      queryOptions.whereFilters?.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });

      queryOptions.orderByFields?.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });

      // Start after last document
      q = query(q, startAfter(lastDoc), limit(pageSize));

      const snapshot = await getDocs(q);
      const newDocs = [];
      snapshot.forEach((doc) => {
        newDocs.push({ id: doc.id, ...doc.data() });
      });

      if (newDocs.length > 0) {
        setAllData(prev => [...prev, ...newDocs]);
        setLastDoc(newDocs[newDocs.length - 1]);
        setHasMore(newDocs.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more data:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [path, queryOptions, lastDoc, hasMore, loadingMore, pageSize]);

  return {
    data: allData,
    loading: initialLoading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    isEmpty: allData.length === 0 && !initialLoading
  };
};
