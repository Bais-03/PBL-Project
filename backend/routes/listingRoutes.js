const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

const {
  createListing,
  getAllListings,
  getListingById,
} = require("../controllers/listingController");

const auth = require("../middleware/authMiddleware");
const campusOnly = require("../middleware/campusOnly");

// ✅ PUBLIC ROUTES (NO TOKEN)
router.get("/", getAllListings);
router.get("/:id", getListingById);

// 🔒 PROTECTED ROUTES
router.post("/", campusOnly, createListing);

// Delete listing
router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if user owns this listing
    if (listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Update listing status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if user owns this listing
    if (listing.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    listing.status = status;
    await listing.save();

    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;