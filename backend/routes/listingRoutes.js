const express = require("express");
const router = express.Router();

const {
  createListing,
  getAllListings,
  getListingById,
} = require("../controllers/listingController");

const campusOnly = require("../middleware/campusOnly");

// ✅ PUBLIC ROUTES (NO TOKEN)
router.get("/", getAllListings);
router.get("/:id", getListingById);

// 🔒 PROTECTED ROUTE
router.post("/", campusOnly, createListing);

module.exports = router;