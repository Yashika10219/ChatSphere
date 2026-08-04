const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    default: "",
  },
  replyTo: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Message",
  default: null,
},

  file: {
    type: String,
    default: "",
  },

  fileType: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },

  // 👇 Delete for Me
  deletedFor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],

  // 👇 Delete for Everyone
  isDeleted: {
    type: Boolean,
    default: false,
  },

  deletedAt: {
    type: Date,
    default: null,
  }

});


module.exports = mongoose.model("Message", messageSchema);