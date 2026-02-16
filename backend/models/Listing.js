const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    semester: { type: Number, required: true },
    description: { type: String },
    available: { type: Boolean, default: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);