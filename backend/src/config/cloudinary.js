const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const logger = require("./logger");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

logger.info("☁️  Cloudinary configured successfully.");

// ─── Storage Configurations ───────────────────────────────────────────────

// Hotel Images Storage
const hotelStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "luxury-hotel/hotels",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto:best" }],
  },
});

// Room Images Storage
const roomStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "luxury-hotel/rooms",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 700, crop: "limit", quality: "auto:best" }],
  },
});

// Avatar Storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "luxury-hotel/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face", quality: "auto" }],
  },
});

// Review Images Storage
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "luxury-hotel/reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit", quality: "auto" }],
  },
});

// ─── File Filter ─────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Attach a recognizable code so the error handler can map this CLIENT error
    // to a 400 Bad Request instead of surfacing it as an unhandled 500.
    const err = new Error("Only image files (JPEG, PNG, WebP) are allowed");
    err.code = "UNSUPPORTED_FILE_TYPE";
    cb(err, false);
  }
};

// ─── Multer Upload Instances ──────────────────────────────────────────────
const uploadHotelImages = multer({
  storage: hotelStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file, max 10
});

const uploadRoomImages = multer({
  storage: roomStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB for avatars
});

const uploadReviewImages = multer({
  storage: reviewStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// ─── Helper: Delete from Cloudinary ──────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Failed to delete from Cloudinary: ${error.message}`);
    throw error;
  }
};

// ─── Helper: Delete multiple from Cloudinary ─────────────────────────────
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    logger.error(`Failed to delete multiple from Cloudinary: ${error.message}`);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadHotelImages,
  uploadRoomImages,
  uploadAvatar,
  uploadReviewImages,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
