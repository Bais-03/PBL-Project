const Notification = require("../models/Notification");

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, unreadOnly = false } = req.query;

    const query = { user: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort("-createdAt")
      .limit(parseInt(limit));

    res.json(notifications);

  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, notification });

  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ success: true, message: "All notifications marked as read" });

  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      user: userId,
      read: false
    });

    res.json({ count });

  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};