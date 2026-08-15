const mongoose = require("mongoose");

/**
 * Faq — a question/answer surfaced in the Home "FAQ" accordion.
 * Mirrors the frontend Faq.jsx contract: title, content.
 */
const faqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      maxlength: 2000,
    },
    category: { type: String, trim: true, maxlength: 60 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

faqSchema.index({ isActive: 1, sortOrder: 1 });
faqSchema.index({ category: 1 });

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;