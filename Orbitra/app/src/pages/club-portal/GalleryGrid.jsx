import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { useGallery } from '../../hooks/useGallery';
import { getOptimizedImageUrl, getThumbnailUrl } from '../../utils/cloudinaryHelpers';
import { 
  PhotoIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GalleryGrid = () => {
  const { club, clubSlug, isAdmin, isModerator, currentUser } = useClubPortal();
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnmoderated, setShowUnmoderated] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, masonry
  
  const observerRef = useRef();
  const loadMoreRef = useRef();

  const {
    albums,
    images,
    loading,
    loadingMore,
    hasMore,
    error,
    createAlbum,
    uploadImages,
    moderateImage,
    deleteImage,
    loadMore,
    unmoderatatedImages
  } = useGallery(club?.id, {
    albumId: selectedAlbum,
    includeUnmoderated: showUnmoderated && (isAdmin || isModerator),
    realtime: true
  });

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadingMore, loadMore]);

  // Filter images based on search
  const filteredImages = images.filter(image =>
    image.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImageClick = (image) => {
    setLightboxImage(image);
    setShowLightbox(true);
  };

  const handleImageModeration = async (imageId, approved) => {
    try {
      await moderateImage(imageId, approved);
    } catch (error) {
      console.error('Error moderating image:', error);
    }
  };

  const handleImageDelete = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteImage(imageId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const ImageCard = ({ image, index }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div 
        className="aspect-square cursor-pointer overflow-hidden"
        onClick={() => handleImageClick(image)}
      >
        <img
          src={getThumbnailUrl(image.publicId, 300)}
          alt={image.fileName || 'Gallery image'}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
          <button
            onClick={() => handleImageClick(image)}
            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
          >
            <EyeIcon className="w-4 h-4 text-gray-700" />
          </button>
          
          {(isAdmin || isModerator) && (
            <button
              onClick={() => handleImageDelete(image.id)}
              className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            >
              <TrashIcon className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Moderation status */}
      {!image.moderated && (isAdmin || isModerator) && (
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={() => handleImageModeration(image.id, true)}
            className="p-1 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
            title="Approve"
          >
            <CheckIcon className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={() => handleImageModeration(image.id, false)}
            className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            title="Reject"
          >
            <XMarkIcon className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Unmoderated indicator */}
      {!image.moderated && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
            Pending
          </span>
        </div>
      )}

      {/* Image info */}
      <div className="p-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {image.fileName || 'Untitled'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(image.createdAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading gallery: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {selectedAlbum 
              ? `Album: ${albums.find(a => a.id === selectedAlbum)?.title || 'Unknown'}`
              : 'All photos and memories'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {(isAdmin || isModerator) && unmoderatatedImages.length > 0 && (
            <button
              onClick={() => setShowUnmoderated(!showUnmoderated)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                showUnmoderated
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
              }`}
            >
              {unmoderatatedImages.length} Pending
            </button>
          )}
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
        {/* Albums filter */}
        <div className="flex items-center space-x-2">
          <FolderIcon className="w-5 h-5 text-gray-400" />
          <select
            value={selectedAlbum || ''}
            onChange={(e) => setSelectedAlbum(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Albums</option>
            {albums.map(album => (
              <option key={album.id} value={album.id}>
                {album.title} ({album.imageCount || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Toggle view mode"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No images found' : 'No images yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.'
              : 'Upload your first images to get started.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Upload Images
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {filteredImages.map((image, index) => (
              <ImageCard key={image.id} image={image} index={index} />
            ))}
          </div>

          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loadingMore ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              ) : (
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-full"
            >
              <img
                src={getOptimizedImageUrl(lightboxImage.publicId, { width: 1200 })}
                alt={lightboxImage.fileName || 'Gallery image'}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
              
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-4">
                <h3 className="text-white font-medium">
                  {lightboxImage.fileName || 'Untitled'}
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  {lightboxImage.width} × {lightboxImage.height} • {new Date(lightboxImage.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal - Will be implemented separately */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Upload Images
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload modal will be implemented in UploadGalleryModal.jsx
            </p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryGrid;
