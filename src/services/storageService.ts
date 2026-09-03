import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BUCKET_NAME = 'restaurant-images';
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload an image to Supabase Storage bucket 'restaurant-images'
 */
export const uploadRestaurantImage = async (
  file: File,
  folder = 'menu'
): Promise<UploadResult> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please configure your environment variables to upload images.');
  }

  // 1. Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Unsupported image format. Please upload a WebP, JPEG, or PNG image.');
  }

  // 2. Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image size exceeds 2MB limit. Please choose a smaller image to preserve storage.');
  }

  // 3. Generate sanitized unique path
  const fileExt = file.name.split('.').pop() || 'webp';
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  const fileName = `${cleanBaseName}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // 4. Upload file
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // 5. Get public URL
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
  };
};

/**
 * Delete image from bucket
 */
export const deleteRestaurantImage = async (filePath: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return true;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  if (error) {
    console.warn('Failed to delete image from storage:', error.message);
    return false;
  }
  return true;
};
