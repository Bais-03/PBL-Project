const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Configuration for rebooking limits
const MAX_REBOOKINGS_PER_ITEM = 3; // Maximum number of times a user can rebook the same item after cancellation
const REBOOKING_COOLDOWN_MINUTES = 5; // Minutes to wait before rebooking after cancellation

// Create a booking request
exports.createBookingRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;
    const userId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if listing is available
    if (listing.status !== "available") {
      return res.status(400).json({ message: "Item is not available" });
    }

    // Check if user is trying to book their own listing
    if (listing.createdBy.toString() === userId) {
      return res.status(400).json({ message: "You cannot book your own listing" });
    }

    // ✅ Check if user already has a PENDING or ACCEPTED booking for this listing
    const existingActiveBooking = await Booking.findOne({
      listing: listingId,
      user: userId,
      status: { $in: ["pending", "accepted"] }
    });

    if (existingActiveBooking) {
      return res.status(400).json({ 
        message: "You already have an active booking request for this item. Please wait for seller's response." 
      });
    }

    // ✅ Check for recent cancellation (anti-spam measure)
    const recentCancellation = await Booking.findOne({
      listing: listingId,
      user: userId,
      status: "cancelled",
      updatedAt: { $gt: new Date(Date.now() - REBOOKING_COOLDOWN_MINUTES * 60 * 1000) }
    });

    if (recentCancellation) {
      const remainingMinutes = Math.ceil(
        (REBOOKING_COOLDOWN_MINUTES * 60 * 1000 - (Date.now() - recentCancellation.updatedAt)) / 60000
      );
      return res.status(400).json({ 
        message: `You recently cancelled a booking for this item. Please wait ${remainingMinutes} minute(s) before trying again.` 
      });
    }

    // ✅ Check rebooking limit (prevent abuse)
    const cancelledCount = await Booking.countDocuments({
      listing: listingId,
      user: userId,
      status: "cancelled"
    });

    if (cancelledCount >= MAX_REBOOKINGS_PER_ITEM) {
      return res.status(400).json({ 
        message: `You have cancelled this booking ${MAX_REBOOKINGS_PER_ITEM} times. For fair usage, you cannot book this item again.` 
      });
    }

    // Create booking request
    const booking = new Booking({
      user: userId,
      listing: listingId,
      seller: listing.createdBy,
      message: message || "",
      status: "pending",
      rebookingCount: cancelledCount + 1
    });

    await booking.save();

    // Update listing status to pending
    listing.status = "pending";
    listing.pendingBooking = booking._id;
    await listing.save();

    // Create notification for seller
    const buyer = await User.findById(userId);
    await Notification.create({
      user: listing.createdBy,
      type: "booking_request",
      title: "New Booking Request",
      message: `${buyer.name} wants to book "${listing.title}". Please review the request.`,
      relatedId: booking._id,
      relatedModel: "Booking"
    });

    res.status(201).json({
      success: true,
      message: "Booking request sent successfully",
      booking
    });

  } catch (err) {
    console.error("Booking request error:", err);
    // Handle any remaining duplicate key errors gracefully
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Unable to create booking. Please check your existing bookings." 
      });
    }
    res.status(500).json({ message: "Failed to create booking request" });
  }
};

// Accept booking request
exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId, responseMessage } = req.body;
    const sellerId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email phone phoneNumber mobile")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify seller is the listing owner
    if (booking.seller.toString() !== sellerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if booking is still pending
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking request is no longer pending" });
    }

    // Update booking
    booking.status = "accepted";
    booking.sellerResponse = responseMessage || "";
    booking.responseDate = new Date();
    await booking.save();

    // Update listing status
    const listing = await Listing.findById(booking.listing._id);
    listing.status = "booked";
    listing.pendingBooking = null;
    listing.bookedBy = booking.user._id;
    listing.bookedAt = new Date();
    await listing.save();

    // Create notification for buyer
    await Notification.create({
      user: booking.user._id,
      type: "booking_accepted",
      title: "Booking Request Accepted",
      message: `Your booking request for "${listing.title}" has been accepted. You can now contact the seller.`,
      relatedId: booking._id,
      relatedModel: "Booking"
    });

    res.json({
      success: true,
      message: "Booking request accepted",
      booking
    });

  } catch (err) {
    console.error("Accept booking error:", err);
    res.status(500).json({ message: "Failed to accept booking" });
  }
};

// Reject booking request
exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId, rejectionReason } = req.body;
    const sellerId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email phone phoneNumber mobile")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify seller is the listing owner
    if (booking.seller.toString() !== sellerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if booking is still pending
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking request is no longer pending" });
    }

    // Update booking
    booking.status = "rejected";
    booking.sellerResponse = rejectionReason || "Seller has rejected the request";
    booking.responseDate = new Date();
    await booking.save();

    // Update listing status back to available
    const listing = await Listing.findById(booking.listing._id);
    listing.status = "available";
    listing.pendingBooking = null;
    await listing.save();

    // Create notification for buyer
    await Notification.create({
      user: booking.user._id,
      type: "booking_rejected",
      title: "Booking Request Rejected",
      message: `Your booking request for "${listing.title}" was rejected. ${booking.sellerResponse}`,
      relatedId: booking._id,
      relatedModel: "Booking"
    });

    res.json({
      success: true,
      message: "Booking request rejected",
      booking
    });

  } catch (err) {
    console.error("Reject booking error:", err);
    res.status(500).json({ message: "Failed to reject booking" });
  }
};

// Cancel booking (by buyer) - only allowed when status is "pending"
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user is the buyer
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow cancellation when booking is still pending
    if (booking.status !== "pending") {
      return res.status(400).json({ 
        message: "Booking can only be cancelled before the seller accepts it" 
      });
    }

    // Update booking status to cancelled
    booking.status = "cancelled";
    await booking.save();

    // Restore listing to available
    const listing = await Listing.findById(booking.listing._id);
    listing.status = "available";
    listing.pendingBooking = null;
    await listing.save();

    // Create notification for seller
    await Notification.create({
      user: booking.seller,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: `The booking for "${listing.title}" has been cancelled by the buyer.`,
      relatedId: booking._id,
      relatedModel: "Booking"
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully. You can now book this item again."
    });

  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

// Complete booking (by seller)
exports.completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const sellerId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email phone phoneNumber mobile")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify seller is the listing owner
    if (booking.seller.toString() !== sellerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if booking is accepted
    if (booking.status !== "accepted") {
      return res.status(400).json({ message: "Booking must be accepted before completion" });
    }

    // Update booking
    booking.status = "completed";
    booking.completedDate = new Date();
    await booking.save();

    // Update listing status
    const listing = await Listing.findById(booking.listing._id);
    listing.status = "sold";
    await listing.save();

    // Create notification for buyer
    await Notification.create({
      user: booking.user._id,
      type: "booking_completed",
      title: "Transaction Completed",
      message: `Your transaction for "${listing.title}" has been marked as completed. Please rate the seller.`,
      relatedId: booking._id,
      relatedModel: "Booking"
    });

    res.json({
      success: true,
      message: "Booking marked as completed"
    });

  } catch (err) {
    console.error("Complete booking error:", err);
    res.status(500).json({ message: "Failed to complete booking" });
  }
};

// Rate booking (by buyer)
exports.rateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId).populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify user is the buyer
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed transactions" });
    }

    // Check if already rated
    if (booking.rating && booking.rating.score) {
      return res.status(400).json({ message: "Already rated this transaction" });
    }

    // Update rating
    booking.rating = {
      score: rating,
      review: review || "",
      ratedAt: new Date()
    };
    await booking.save();

    // Update seller's average rating
    const sellerBookings = await Booking.find({
      seller: booking.seller,
      status: "completed",
      "rating.score": { $exists: true }
    });

    const averageRating = sellerBookings.reduce((sum, b) => sum + b.rating.score, 0) / sellerBookings.length;

    await User.findByIdAndUpdate(booking.seller, {
      averageRating: averageRating,
      totalRatings: sellerBookings.length
    });

    res.json({
      success: true,
      message: "Rating submitted successfully"
    });

  } catch (err) {
    console.error("Rate booking error:", err);
    res.status(500).json({ message: "Failed to submit rating" });
  }
};

// Get user's bookings (with different statuses)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = {
      $or: [{ user: userId }, { seller: userId }]
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone phoneNumber mobile averageRating")
      .populate("seller", "name email phone phoneNumber mobile averageRating")
      .populate({
        path: "listing",
        populate: { path: "createdBy", select: "name email phone phoneNumber mobile" }
      })
      .sort("-createdAt");

    res.json(bookings);

  } catch (err) {
    console.error("Get user bookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Get single booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate("user", "name email phone phoneNumber mobile averageRating")
      .populate("seller", "name email phone phoneNumber mobile averageRating")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is part of this booking
    if (booking.user._id.toString() !== userId && booking.seller._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(booking);

  } catch (err) {
    console.error("Get booking details error:", err);
    res.status(500).json({ message: "Failed to fetch booking details" });
  }
};