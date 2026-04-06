const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  getUnreadCount
} = require("../controllers/messageController");

router.use(auth);

router.post("/send", sendMessage);
router.get("/booking/:bookingId", getMessages);
router.get("/unread/count", getUnreadCount);

module.exports = router;