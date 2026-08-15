const mongoose = require("mongoose");
const logger = require("../../config/logger");

const reviewSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking reference is required"],
      unique: true, // One review per booking
    },
    rating: {
      overall: { type: Number, required: true, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      location: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      comfort: { type: Number, min: 1, max: 5 },
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    body: {
      type: String,
      required: [true, "Review body is required"],
      minlength: [20, "Review must be at least 20 characters"],
      maxlength: [2000, "Review cannot exceed 2000 characters"],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    response: {
      text: String,
      respondedAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false, // Set to true if booking is confirmed stay
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulVoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────
// Note: booking uses `unique: true` on the field, which auto-creates its index.
reviewSchema.index({ hotel: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ "rating.overall": -1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ isActive: 1 });
reviewSchema.index({ createdAt: -1 });
// Compound indexes backing getHotelReviews (hotel + active filter, then sort)
reviewSchema.index({ hotel: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ hotel: 1, isActive: 1, "rating.overall": -1 });

// ─── Post-save: Update hotel's avgRating & totalReviews ──────────────────
reviewSchema.post("save", async function () {
  await updateHotelRating(this.hotel);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await updateHotelRating(doc.hotel);
  }
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateHotelRating(doc.hotel);
  }
});

async function updateHotelRating(hotelId) {
  try {
    const Hotel = mongoose.model("Hotel");
    const result = await mongoose.model("Review").aggregate([
      { $match: { hotel: hotelId, isActive: true } },
      {
        $group: {
          _id: "$hotel",
          avgRating: { $avg: "$rating.overall" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await Hotel.findByIdAndUpdate(hotelId, {
        avgRating: result[0].avgRating,
        totalReviews: result[0].totalReviews,
      });
    } else {
      await Hotel.findByIdAndUpdate(hotelId, { avgRating: 0, totalReviews: 0 });
    }
  } catch (error) {
    logger.error(`Failed to update hotel rating for hotel ${hotelId}: ${error.message}`);
  }
}

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
