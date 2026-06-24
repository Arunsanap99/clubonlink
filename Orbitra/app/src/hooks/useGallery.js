import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImageToCloudinary, generateImageMetadata } from '../utils/cloudinaryHelpers';
import toast from 'react-hot-toast';

/**
 * Hook for managing club gallery with albums and images
 * @param {string} clubId - Club ID
 * @param {Object} options - Configuration options
 */
export const useGallery = (clubId, options = {}) => {
  const {
    pageSize = 20,
    albumId = null, // Filter by specific album
    includeUnmoderated = false, // Show unmoderated images (admin only)
    realtime = true
  } = options;

  const [albums, setAlbums] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [error, setError] = useState(null);

  // Load albums
  useEffect(() => {
    if (!clubId) return;

    const albumsRef = collection(db, 'clubs', clubId, 'gallery', 'albums');
    const albumsQuery = query(albumsRef, orderBy('createdAt', 'desc'));

    if (realtime) {
      const unsubscribe = onSnapshot(
        albumsQuery,
        (snapshot) => {
          const albumsData = [];
          snapshot.forEach((doc) => {
            albumsData.push({ id: doc.id, ...doc.data() });
          });
          setAlbums(albumsData);
        },
        (err) => {
          console.error('Error loading albums:', err);
          setError(err.message);
        }
      );

      return () => unsubscribe();
    } else {
      getDocs(albumsQuery)
        .then((snapshot) => {
          const albumsData = [];
          snapshot.forEach((doc) => {
            albumsData.push({ id: doc.id, ...doc.data() });
          });
          setAlbums(albumsData);
        })
        .catch((err) => {
          console.error('Error loading albums:', err);
          setError(err.message);
        });
    }
  }, [clubId, realtime]);

  // Load images
  useEffect(() => {
    if (!clubId) return;

    loadImages(true);
  }, [clubId, albumId, includeUnmoderated]);

  const loadImages = useCallback(async (reset = false) => {
    if (!clubId) return;

    try {
      if (reset) {
        setLoading(true);
        setImages([]);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const imagesRef = collection(db, 'clubs', clubId, 'gallery', 'images');
      let imagesQuery = query(imagesRef, orderBy('createdAt', 'desc'));

      // Filter by album if specified
      if (albumId) {
        imagesQuery = query(imagesQuery, where('albumId', '==', albumId));
      }

      // Filter moderated images unless admin
      if (!includeUnmoderated) {
        imagesQuery = query(imagesQuery, where('moderated', '==', true));
      }

      // Add pagination
      imagesQuery = query(imagesQuery, limit(pageSize));
      if (!reset && lastDoc) {
        imagesQuery = query(imagesQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(imagesQuery);
      const newImages = [];
      
      snapshot.forEach((doc) => {
        newImages.push({ id: doc.id, ...doc.data() });
      });

      if (reset) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }

      setHasMore(newImages.length === pageSize);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setError(null);
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [clubId, albumId, includeUnmoderated, pageSize, lastDoc]);

  // Create album
  const createAlbum = useCallback(async (albumData, createdBy) => {
    if (!clubId) throw new Error('Club ID is required');

    try {
      const albumsRef = collection(db, 'clubs', clubId, 'gallery', 'albums');
      const newAlbum = {
        ...albumData,
        createdBy,
        createdAt: new Date().toISOString(),
        imageCount: 0
      };

      const docRef = await addDoc(albumsRef, newAlbum);
      toast.success('Album created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error('Failed to create album');
      throw error;
    }
  }, [clubId]);

  // Update album
  const updateAlbum = useCallback(async (albumId, updates) => {
    if (!clubId || !albumId) throw new Error('Club ID and Album ID are required');

    try {
      const albumRef = doc(db, 'clubs', clubId, 'gallery', 'albums', albumId);
      await updateDoc(albumRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      toast.success('Album updated successfully');
    } catch (error) {
      console.error('Error updating album:', error);
      toast.error('Failed to update album');
      throw error;
    }
  }, [clubId]);

  // Delete album
  const deleteAlbum = useCallback(async (albumId) => {
    if (!clubId || !albumId) throw new Error('Club ID and Album ID are required');

    try {
      // First, delete all images in the album
      const imagesRef = collection(db, 'clubs', clubId, 'gallery', 'images');
      const imagesQuery = query(imagesRef, where('albumId', '==', albumId));
      const imagesSnapshot = await getDocs(imagesQuery);

      const batch = writeBatch(db);
      imagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete the album
      const albumRef = doc(db, 'clubs', clubId, 'gallery', 'albums', albumId);
      batch.delete(albumRef);

      await batch.commit();
      toast.success('Album and all images deleted successfully');
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album');
      throw error;
    }
  }, [clubId]);

  // Upload images
  const uploadImages = useCallback(async (files, albumId, uploaderId, onProgress = null) => {
    if (!clubId) throw new Error('Club ID is required');
    if (!files || files.length === 0) throw new Error('No files provided');

    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update progress
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'uploading'
          });
        }

        // Upload to Cloudinary
        const cloudinaryResult = await uploadImageToCloudinary(
          file,
          {
            folder: `clubhub/clubs/${clubId}/gallery`,
            tags: [clubId, albumId || 'unorganized']
          },
          (uploadProgress) => {
            if (onProgress) {
              onProgress({
                current: i + 1,
                total: files.length,
                fileName: file.name,
                status: 'uploading',
                uploadProgress
              });
            }
          }
        );

        // Save to Firestore
        const imageMetadata = generateImageMetadata(cloudinaryResult, {
          albumId: albumId || null,
          uploaderId,
          fileName: file.name,
          fileSize: file.size
        });

        const imagesRef = collection(db, 'clubs', clubId, 'gallery', 'images');
        const docRef = await addDoc(imagesRef, imageMetadata);

        results.push({ id: docRef.id, ...imageMetadata });

        // Update album image count if album specified
        if (albumId) {
          const albumRef = doc(db, 'clubs', clubId, 'gallery', 'albums', albumId);
          await updateDoc(albumRef, {
            imageCount: (albums.find(a => a.id === albumId)?.imageCount || 0) + 1,
            updatedAt: new Date().toISOString()
          });
        }

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'completed'
          });
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push({ fileName: file.name, error: error.message });
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    if (results.length > 0) {
      toast.success(`${results.length} image(s) uploaded successfully`);
    }
    
    if (errors.length > 0) {
      toast.error(`${errors.length} image(s) failed to upload`);
    }

    return { results, errors };
  }, [clubId, albums]);

  // Moderate image (admin only)
  const moderateImage = useCallback(async (imageId, approved) => {
    if (!clubId || !imageId) throw new Error('Club ID and Image ID are required');

    try {
      const imageRef = doc(db, 'clubs', clubId, 'gallery', 'images', imageId);
      await updateDoc(imageRef, {
        moderated: approved,
        moderatedAt: new Date().toISOString()
      });
      
      toast.success(`Image ${approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      console.error('Error moderating image:', error);
      toast.error('Failed to moderate image');
      throw error;
    }
  }, [clubId]);

  // Delete image
  const deleteImage = useCallback(async (imageId) => {
    if (!clubId || !imageId) throw new Error('Club ID and Image ID are required');

    try {
      const imageRef = doc(db, 'clubs', clubId, 'gallery', 'images', imageId);
      await deleteDoc(imageRef);
      
      // Note: Cloudinary deletion should be handled server-side
      // Call Cloud Function to delete from Cloudinary
      
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      throw error;
    }
  }, [clubId]);

  // Load more images
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadImages(false);
    }
  }, [loadImages, loadingMore, hasMore]);

  // Refresh data
  const refresh = useCallback(() => {
    loadImages(true);
  }, [loadImages]);

  return {
    // Data
    albums,
    images,
    loading,
    loadingMore,
    hasMore,
    error,
    
    // Actions
    createAlbum,
    updateAlbum,
    deleteAlbum,
    uploadImages,
    moderateImage,
    deleteImage,
    loadMore,
    refresh,
    
    // Computed
    totalImages: images.length,
    unmoderatatedImages: images.filter(img => !img.moderated),
    albumsWithCounts: albums.map(album => ({
      ...album,
      imageCount: images.filter(img => img.albumId === album.id).length
    }))
  };
};
