const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require("../controllers/notificationController");

router.use(auth);

router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.patch("/:notificationId/read", markAsRead);
router.patch("/read-all", markAllAsRead);

module.exports = router;