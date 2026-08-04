const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const upload = require("../middleware/upload");

const {
  sendMessage,
  getMessages,
  getAllMessages,
  deleteMessage,
  deleteForMe,
  clearChat,
} = require("../controllers/messageController");

// Send a message
router.post(
  "/",
  upload.single("file"),
  sendMessage
);

// Get all messages
router.get("/", getAllMessages);

// Last message
router.get("/last/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(1);

    res.json(messages[0] || null);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Mark message delivered
router.patch("/:id/delivered", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "delivered" },
      { returnDocument: "after" }
    );

    res.json(message);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Mark message seen
router.patch("/:id/seen", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "seen" },
      { returnDocument: "after" }
    );

    res.json(message);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// Delete message (for everyone)
router.patch("/:id/delete", deleteMessage);
router.put("/delete-for-me/:id", deleteForMe);
router.put("/clear-chat", clearChat);
// Get unread messages for logged in user
router.get("/unread/:userId", async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.params.userId,
      status: { $ne: "seen" },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get messages between two users
router.get("/:sender/:receiver", getMessages);

module.exports = router;