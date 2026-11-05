import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 8 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      const error = new Error('Only JPG, PNG and WebP images are supported');
      error.status = 415;
      return cb(error);
    }
    cb(null, true);
  }
});

export function imageStorageConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configureCloudinary() {
  if (!imageStorageConfigured()) {
    const error = new Error('Image uploads are unavailable until Cloudinary is configured on the backend');
    error.status = 503;
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    hide_sensitive: true
  });
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

export async function uploadImage(file) {
  if (!file) return null;
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: 'indifolks', resource_type: 'image', transformation: [{ width: 1600, height: 1600, crop: 'limit' }]
    }, (error, result) => error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id }));
    stream.end(file.buffer);
  });
}
