const Message = require("../models/Message");
const User = require("../models/User");
// ==============================
// Send Message
// ==============================

const sendMessage = async (req, res) => {
  console.log("🔥 SEND MESSAGE API HIT");
  try {
     console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { sender, receiver, text, replyTo } = req.body;

const message = await Message.create({
  sender,
  receiver,
  text: text || "",
  replyTo: replyTo || null,
  file: req.file ? `/uploads/${req.file.filename}` : "",
  fileType: req.file ? req.file.mimetype : "",
});

    const populatedMessage = await Message.findById(message._id)
      
  .populate("sender", "name profilePic")
  .populate("replyTo");

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==============================
// Get All Messages
// ==============================

const getAllMessages = async (req, res) => {
  try {

    const messages = await Message.find()
  .populate("replyTo")
  .sort({ createdAt: 1 });
    res.status(200).json(messages);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ==============================
// Get Messages Between Two Users
// ==============================

const getMessages = async (req, res) => {
  try {

    const { sender, receiver } = req.params;

    const messages = await Message.find({
  $or: [
    {
      sender: sender,
      receiver: receiver
    },
    {
      sender: receiver,
      receiver: sender
    }
  ],

  deletedFor: {
    $ne: sender
  }

})
.populate("replyTo")
.sort({ createdAt: 1 });


    res.status(200).json(messages);


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
// ==============================
// Mark Delivered
// ==============================

const markDelivered = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "delivered" },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Mark Seen
// ==============================

const markSeen = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "seen" },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ==============================
// Delete Message (Everyone)
// ==============================

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        text: "This message was deleted",
      },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ==============================
// Delete Message (Me)
// ==============================

const deleteForMe = async (req, res) => {
  try {

    const { userId } = req.body;

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found"
      });
    }


    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }


    await message.save();


    res.json({
      message: "Deleted for me"
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};
const clearChat = async (req, res) => {
  try {

    const { userId, otherUserId } = req.body;

    await Message.updateMany(
      {
        $or: [
          {
            sender: userId,
            receiver: otherUserId
          },
          {
            sender: otherUserId,
            receiver: userId
          }
        ]
      },
      {
        $addToSet: {
          deletedFor: userId
        }
      }
    );

    res.json({
      message: "Chat cleared"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  sendMessage,
  getMessages,
  getAllMessages,
  markDelivered,
  markSeen,
  deleteMessage,
  deleteForMe,
  clearChat,
};