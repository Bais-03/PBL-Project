const express = require("express");
const {
  forgotPassword,
  verifyResetToken,
  resetPassword
} = require("../controllers/passwordResetController");

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password/:token", resetPassword);

module.exports = router;