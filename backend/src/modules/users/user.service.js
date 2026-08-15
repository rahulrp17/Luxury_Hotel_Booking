const User = require("./user.model");
const ApiError = require("../../utils/ApiError");
const { parsePagination, buildPagination } = require("../../utils/pagination");
const { escapeRegex } = require("../../utils/regex");
const { deleteFromCloudinary } = require("../../config/cloudinary");
const { setCache, deleteCache, getCache } = require("../../config/redis");
const { CACHE_TTL } = require("../../config/constants");
const logger = require("../../config/logger");

class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    const cacheKey = `user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound("User not found.");

    // Remove sensitive fields just in case lean() bypasses toSafeObject()
    delete user.passwordHash;
    delete user.refreshToken;
    delete user.emailVerificationToken;
    delete user.passwordResetToken;
    delete user.passwordResetExpiry;

    await setCache(cacheKey, user, CACHE_TTL.USER_PROFILE);
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    // Prevent updating sensitive fields via this endpoint
    const allowedUpdates = ["name", "phone", "address", "preferences"];
    const updateData = {};
    
    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = data[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) throw ApiError.notFound("User not found.");

    await deleteCache(`user:${userId}`);
    return user.toSafeObject();
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId, file) {
    if (!file) throw ApiError.badRequest("Please upload an image.");

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found.");

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.publicId) {
      try {
        await deleteFromCloudinary(user.avatar.publicId);
      } catch (err) {
        logger.warn(`Failed to delete old avatar for user ${userId}: ${err.message}`);
      }
    }

    user.avatar = {
      url: file.path,
      publicId: file.filename,
    };

    await user.save();
    await deleteCache(`user:${userId}`);
    return user.toSafeObject();
  }

  // ─── Admin Methods ───────────────────────────────────────────────────────

  /**
   * Admin: Get all users
   */
  async getAllUsers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
    if (query.search) {
      filter.$or = [
        { name: new RegExp(escapeRegex(query.search), "i") },
        { email: new RegExp(escapeRegex(query.search), "i") },
        { phone: new RegExp(escapeRegex(query.search), "i") },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: buildPagination(page, limit, total),
    };
  }

  /**
   * Admin: Toggle user active status (Ban/Unban)
   */
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found.");

    if (user.role === "ADMIN") {
      throw ApiError.forbidden("Cannot disable an admin account.");
    }

    user.isActive = !user.isActive;
    if (!user.isActive) {
      user.refreshToken = null; // Force logout if banned
    }
    
    await user.save();
    await deleteCache(`user:${userId}`);
    
    return user.toSafeObject();
  }
}

module.exports = new UserService();
