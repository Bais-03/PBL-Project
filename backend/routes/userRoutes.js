const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, phone, college, semester } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (college) updateFields.college = college;
    if (semester) updateFields.semester = semester;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's listings
router.get("/listings", auth, async (req, res) => {
  try {
    const listings = await Listing.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's booked items - ✅ FIXED
router.get("/bookings", auth, async (req, res) => {
  try {
    // Fixed: Use valid status values from Booking schema
    const bookings = await Booking.find({ 
      user: req.user.id,
      status: { $in: ["accepted", "completed", "pending"] }  // ✅ Fixed - valid statuses
    })
    .populate("listing")
    .sort("-createdAt");
    
    const bookedItems = bookings.map(booking => booking.listing).filter(item => item !== null);
    res.json(bookedItems);
  } catch (err) {
    console.error("Error fetching user bookings:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;