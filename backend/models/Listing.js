const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
    },
    semester: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    priceType: {
      type: String,
      enum: ["fixed", "negotiable", "free"],
      default: "negotiable",
    },
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactWhatsapp: {
      type: String,
    },
    preferMode: {
      type: String,
    },
    availability: {
      type: String,
    },
    image: {
      type: String,
    },
    images: {  // Add this new field for multiple images
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "pending", "booked", "sold"],
      default: "available",
    },
    pendingBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);