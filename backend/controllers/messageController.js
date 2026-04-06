const Message = require("../models/Message");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId, message } = req.body;
    const senderId = req.user.id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is part of this booking
    const isParticipant = booking.user.toString() === senderId || booking.seller.toString() === senderId;
    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const receiverId = booking.user.toString() === senderId ? booking.seller : booking.user;

    const newMessage = new Message({
      booking: bookingId,
      sender: senderId,
      receiver: receiverId,
      message: message.trim()
    });

    await newMessage.save();

    // Create notification for receiver
    const sender = await User.findById(senderId);
    await Notification.create({
      user: receiverId,
      type: "new_message",
      title: "New Message",
      message: `${sender.name} sent a message about your booking`,
      relatedId: newMessage._id,
      relatedModel: "Message"
    });

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: newMessage
    });

  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get messages for a booking
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is part of this booking
    const isParticipant = booking.user.toString() === userId || booking.seller.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort("createdAt");

    // Mark messages as read
    await Message.updateMany(
      {
        booking: bookingId,
        receiver: userId,
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json(messages);

  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      receiver: userId,
      read: false
    });

    res.json({ count });

  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};