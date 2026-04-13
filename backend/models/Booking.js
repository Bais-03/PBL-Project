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
    // Track number of times this specific booking has been rebooked (for abuse prevention)
    rebookingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ REMOVED unique index to allow rebooking after cancellation
// Old index that caused issues:
// bookingSchema.index({ user: 1, listing: 1, status: "pending" }, { unique: true, sparse: true });

// ✅ Added regular indexes for query performance (not unique)
bookingSchema.index({ user: 1, listing: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ seller: 1, status: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);