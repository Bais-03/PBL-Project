// routes/bookings.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");

// Book an item
router.post("/book", auth, async (req, res) => {
  try {
    const { listingId } = req.body;

    // Check if listing exists and is available
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== "available") {
      return res.status(400).json({ message: "Item is not available for booking" });
    }

    // Check if user is trying to book their own listing
    if (listing.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot book your own listing" });
    }

    // Update listing status
    listing.status = "booked";
    listing.bookedBy = req.user.id;
    listing.bookedAt = new Date();
    await listing.save();

    // Create booking record
    const booking = new Booking({
      user: req.user.id,
      listing: listingId,
      bookedAt: new Date(),
      status: "active"
    });
    await booking.save();

    res.json({ 
      message: "Item booked successfully", 
      listing 
    });
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already booked this item" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel booking
router.post("/cancel", auth, async (req, res) => {
  try {
    const { listingId } = req.body;

    // Find listing booked by this user
    const listing = await Listing.findOne({
      _id: listingId,
      bookedBy: req.user.id,
      status: "booked"
    });

    if (!listing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Make item available again
    listing.status = "available";
    listing.bookedBy = null;
    listing.bookedAt = null;
    await listing.save();

    // Update booking record
    await Booking.findOneAndUpdate(
      { user: req.user.id, listing: listingId },
      { status: "cancelled" }
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's booked items
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.user.id,
      status: "active"
    })
    .populate({
      path: "listing",
      populate: { path: "createdBy", select: "name email" }
    })
    .sort("-bookedAt");

    const listings = bookings.map(booking => booking.listing);
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Check if user has booked a specific item
router.get("/check/:listingId", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      user: req.user.id,
      listing: req.params.listingId,
      status: "active"
    });
    
    res.json({ isBooked: !!booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;