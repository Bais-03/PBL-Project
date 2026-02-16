const express = require("express");
const { getListings, createListing } = require("../controllers/listingController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, getListings);
router.post("/", auth, createListing);

module.exports = router;