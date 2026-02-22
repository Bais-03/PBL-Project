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
      type: String, // Will store base64 or URL
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);