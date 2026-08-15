const mongoose = require("mongoose");
const { AMENITY_CATEGORIES } = require("../../config/constants");

const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"],
      trim: true,
      unique: true,
      maxlength: 50,
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
    },
    category: {
      type: String,
      enum: Object.values(AMENITY_CATEGORIES),
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      maxlength: 200,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Note: name uses `unique: true` on the field, which auto-creates its index.
amenitySchema.index({ category: 1 });

const Amenity = mongoose.model("Amenity", amenitySchema);

module.exports = Amenity;
