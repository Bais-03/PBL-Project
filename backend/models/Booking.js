const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
      default: "",
    },
    sellerResponse: {
      type: String,
      maxlength: 500,
      default: "",
    },
    responseDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: {
        type: String,
        maxlength: 500,
      },
      ratedAt: Date,
    },
  },
  { timestamps: true }
);

// Ensure a user can only have one pending booking per listing
bookingSchema.index({ user: 1, listing: 1, status: "pending" }, { unique: true, sparse: true });

module.exports = mongoose.model("Booking", bookingSchema);