const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createBookingRequest,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  rateBooking,
  getUserBookings,
  getBookingDetails
} = require("../controllers/bookingController");

// Protected routes
router.use(auth);

router.post("/request", createBookingRequest);
router.post("/accept", acceptBooking);
router.post("/reject", rejectBooking);
router.delete("/cancel/:bookingId", cancelBooking);
router.post("/complete/:bookingId", completeBooking);
router.post("/rate/:bookingId", rateBooking);
router.get("/my-bookings", getUserBookings);
router.get("/:bookingId", getBookingDetails);

module.exports = router;