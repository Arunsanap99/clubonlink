/**
 * Cloudinary Helper Functions for Gallery Management
 * Handles image uploads, transformations, and optimization
 */

// Cloudinary configuration - set these in your environment
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';
const CLOUDINARY_API_KEY = process.env.REACT_APP_CLOUDINARY_API_KEY || 'your-api-key';

/**
 * Upload image to Cloudinary using unsigned upload
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result
 */
export const uploadImageToCloudinary = async (file, options = {}, onProgress = null) => {
  const {
    folder = 'clubhub/gallery',
    tags = [],
    transformation = 'c_limit,w_2000,h_2000,q_auto,f_auto',
    eager = 'c_thumb,w_300,h_300,q_auto,f_auto'
  } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('tags', tags.join(','));
  formData.append('transformation', transformation);
  formData.append('eager', eager);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        // Track upload progress
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        } : undefined
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      thumbUrl: result.eager?.[0]?.secure_url || result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      tags: result.tags || []
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Alternative: Signed upload using Cloud Function
 * More secure but requires backend implementation
 * 
 * Cloud Function example:
 * exports.generateSignedUpload = functions.https.onCall(async (data, context) => {
 *   if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
 *   
 *   const { folder, tags } = data;
 *   const timestamp = Math.round(new Date().getTime() / 1000);
 *   
 *   const params = {
 *     timestamp,
 *     folder: folder || 'clubhub/gallery',
 *     tags: tags?.join(',') || '',
 *     transformation: 'c_limit,w_2000,h_2000,q_auto,f_auto'
 *   };
 *   
 *   const signature = cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET);
 *   
 *   return {
 *     signature,
 *     timestamp,
 *     apiKey: CLOUDINARY_API_KEY,
 *     cloudName: CLOUDINARY_CLOUD_NAME,
 *     ...params
 *   };
 * });
 */
export const uploadImageSigned = async (file, signedParams, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add all signed parameters
  Object.keys(signedParams).forEach(key => {
    formData.append(key, signedParams[key]);
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const result = await response.json();
    return {
      publicId: result.public_id,
      url: result.secure_url,
      thumbUrl: result.eager?.[0]?.secure_url || result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Signed upload error:', error);
    throw error;
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'limit',
    quality = 'auto',
    format = 'auto',
    dpr = 'auto'
  } = options;

  const transformations = [
    `c_${crop}`,
    width !== 'auto' ? `w_${width}` : '',
    height !== 'auto' ? `h_${height}` : '',
    `q_${quality}`,
    `f_${format}`,
    `dpr_${dpr}`
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} size - Thumbnail size (default: 300)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (publicId, size = 300) => {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'auto'
  });
};

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Object with different sized URLs
 */
export const getResponsiveImageUrls = (publicId) => {
  return {
    thumbnail: getThumbnailUrl(publicId, 150),
    small: getOptimizedImageUrl(publicId, { width: 400 }),
    medium: getOptimizedImageUrl(publicId, { width: 800 }),
    large: getOptimizedImageUrl(publicId, { width: 1200 }),
    original: getOptimizedImageUrl(publicId)
  };
};

/**
 * Delete image from Cloudinary
 * Note: This requires admin API key and should be done server-side
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImageFromCloudinary = async (publicId) => {
  // This should be implemented as a Cloud Function for security
  console.warn('Image deletion should be handled server-side via Cloud Function');
  
  // Cloud Function example:
  // exports.deleteImage = functions.https.onCall(async (data, context) => {
  //   if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
  //   
  //   const { publicId, clubId } = data;
  //   
  //   // Verify user has permission to delete from this club
  //   const memberDoc = await admin.firestore()
  //     .doc(`clubs/${clubId}/members/${context.auth.uid}`)
  //     .get();
  //   
  //   if (!memberDoc.exists || !['admin', 'owner'].includes(memberDoc.data().role)) {
  //     throw new functions.https.HttpsError('permission-denied');
  //   }
  //   
  //   // Delete from Cloudinary
  //   const result = await cloudinary.uploader.destroy(publicId);
  //   return result;
  // });
  
  throw new Error('Image deletion must be implemented server-side');
};

/**
 * Validate image file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100
  } = options;

  const errors = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`);
  }

  // Check dimensions (requires reading the image)
  return new Promise((resolve) => {
    if (errors.length > 0) {
      resolve({ valid: false, errors });
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        errors.push(`Image dimensions ${img.width}x${img.height} are too small. Minimum: ${minWidth}x${minHeight}`);
      }
      
      resolve({
        valid: errors.length === 0,
        errors,
        dimensions: { width: img.width, height: img.height }
      });
    };
    
    img.onerror = () => {
      errors.push('Invalid image file');
      resolve({ valid: false, errors });
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate image metadata for Firestore
 * @param {Object} cloudinaryResult - Result from Cloudinary upload
 * @param {Object} additionalData - Additional metadata
 * @returns {Object} Firestore document data
 */
export const generateImageMetadata = (cloudinaryResult, additionalData = {}) => {
  return {
    publicId: cloudinaryResult.publicId,
    url: cloudinaryResult.url,
    thumbUrl: cloudinaryResult.thumbUrl,
    width: cloudinaryResult.width,
    height: cloudinaryResult.height,
    format: cloudinaryResult.format,
    bytes: cloudinaryResult.bytes,
    tags: cloudinaryResult.tags || [],
    createdAt: new Date().toISOString(),
    moderated: false, // Requires admin approval
    ...additionalData
  };
};
