import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useGallery } from '../../hooks/useGallery';
import { validateImageFile } from '../../utils/cloudinaryHelpers';
import { 
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FolderIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UploadGalleryModal = ({ 
  isOpen, 
  onClose, 
  clubId, 
  currentUser, 
  albums = [],
  onAlbumCreate 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const { uploadImages, createAlbum } = useGallery(clubId);

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = {};
      rejectedFiles.forEach(({ file, errors: fileErrors }) => {
        errors[file.name] = fileErrors.map(e => e.message).join(', ');
      });
      setValidationErrors(errors);
    }

    // Validate accepted files
    const validatedFiles = [];
    const newErrors = { ...validationErrors };

    for (const file of acceptedFiles) {
      try {
        const validation = await validateImageFile(file);
        if (validation.valid) {
          validatedFiles.push(file);
          delete newErrors[file.name];
        } else {
          newErrors[file.name] = validation.errors.join(', ');
        }
      } catch (error) {
        newErrors[file.name] = 'Failed to validate file';
      }
    }

    setValidationErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validatedFiles]);
  }, [validationErrors]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error('Please enter an album name');
      return;
    }

    try {
      const albumId = await createAlbum(
        {
          title: newAlbumName.trim(),
          description: '',
          visibility: 'public'
        },
        currentUser.uid
      );
      
      setSelectedAlbum(albumId);
      setNewAlbumName('');
      setShowNewAlbum(false);
      
      if (onAlbumCreate) {
        onAlbumCreate({ id: albumId, title: newAlbumName.trim() });
      }
    } catch (error) {
      console.error('Error creating album:', error);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      let albumId = selectedAlbum;
      
      // Create new album if needed
      if (showNewAlbum && newAlbumName.trim()) {
        albumId = await createAlbum(
          {
            title: newAlbumName.trim(),
            description: '',
            visibility: 'public'
          },
          currentUser.uid
        );
      }

      const { results, errors } = await uploadImages(
        selectedFiles,
        albumId || null,
        currentUser.uid,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [progress.fileName]: progress
          }));
        }
      );

      if (results.length > 0) {
        toast.success(`Successfully uploaded ${results.length} image(s)`);
        onClose();
        setSelectedFiles([]);
        setUploadProgress({});
      }

      if (errors.length > 0) {
        console.error('Upload errors:', errors);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Upload Images
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Album Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Album (Optional)
            </label>
            
            {!showNewAlbum ? (
              <div className="flex space-x-2">
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No Album (General Gallery)</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowNewAlbum(true)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Album name"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleCreateAlbum}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewAlbum(false);
                    setNewAlbumName('');
                  }}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                Drop the images here...
              </p>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                  Drag & drop images here, or click to select
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports JPEG, PNG, WebP, GIF up to 10MB each
                </p>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                  File Validation Errors
                </h4>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                {Object.entries(validationErrors).map(([fileName, error]) => (
                  <li key={fileName}>
                    <strong>{fileName}:</strong> {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selected Files ({selectedFiles.length})
              </h3>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const progress = uploadProgress[file.name];
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <PhotoIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      {progress ? (
                        <div className="flex items-center space-x-2">
                          {progress.status === 'completed' ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : progress.status === 'error' ? (
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          ) : (
                            <div className="w-5 h-5">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {progress.uploadProgress || 0}%
                          </span>
                        </div>
                      ) : !uploading ? (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4 text-gray-500" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Uploading images...
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Please don't close this window while uploading
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadGalleryModal;
