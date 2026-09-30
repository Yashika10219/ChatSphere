const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
require("dotenv").config();

const { Server } = require("socket.io");
const Message = require("./models/Message");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

// ==========================
// Middleware
// ==========================
// Middleware
// ==========================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ==========================
// Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// ==========================
// MongoDB
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// ==========================
// Socket.io
// ==========================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      // yaha baad me Vercel URL add karna
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
// ==========================
// Memory
// ==========================
const onlineUsers = {};
const lastSeen = {};
const activeChats = {};
// ==========================
// Socket Events
// ==========================
io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  // Join personal room
socket.on("join", async (userId) => {
  onlineUsers[userId] = socket.id;

  socket.join(userId);

  io.emit("onlineUsers", Object.keys(onlineUsers));
  io.emit("lastSeen", lastSeen);

  console.log("JOIN:", userId);
  console.log("ONLINE USERS OBJECT:", onlineUsers);
console.log("ONLINE USERS ARRAY:", Object.keys(onlineUsers));

  // ==========================
  // Deliver pending messages
  // ==========================
  const pendingMessages = await Message.find({
    receiver: userId,
    status: "sent",
  });

  for (const msg of pendingMessages) {
    await Message.findByIdAndUpdate(
      msg._id,
      { status: "delivered" },
      { new: true }
    );

    io.to(userId).emit("receiveMessage", {
      ...msg.toObject(),
      status: "delivered",
    });

    io.to(String(msg.sender)).emit(
      "messageDelivered",
      msg._id
    );
  }
});
  // Active chat
  socket.on("activeChat", ({ userId, chattingWith }) => {
    activeChats[userId] = chattingWith;
  });

  // Send message
  // Send message
socket.on("sendMessage", async (message) => {
  console.log("🔥 SOCKET SEND EVENT RECEIVED");
console.log(message);

  const receiverId = String(message.receiver?._id || message.receiver);
  const senderId = String(message.sender?._id || message.sender);
  console.log("receiverId =", receiverId);
console.log("onlineUsers =", onlineUsers);
console.log("onlineUsers[receiverId] =", onlineUsers[receiverId]);

  console.log("📨 Message:", senderId, "->", receiverId);

  // Receiver online hai to hi deliver karo
  if (onlineUsers[receiverId]) {

    await Message.findByIdAndUpdate(
      message._id,
      { status: "delivered" },
      { new: true }
    );

    const updatedMessage = await Message.findById(message._id)
      .populate("sender", "name profilePic");

    io.to(receiverId).emit("receiveMessage", updatedMessage);

    io.to(senderId).emit("messageDelivered", message._id);
  }

});
  // Typing
  socket.on("typing", (data) => {
    io.to(String(data.receiver)).emit("typing", data);
  });

  // Stop Typing
  socket.on("stopTyping", (data) => {
    io.to(String(data.receiver)).emit("stopTyping", data);
  });

  // Delivered
  socket.on("messageDelivered", (messageId) => {
    io.emit("messageDelivered", messageId);
  });

  // Seen
  socket.on("messageSeen", (messageId) => {
    io.emit("messageSeen", messageId);
  });
  // Delete Message
socket.on("deleteMessage", (message) => {
   console.log("🗑 DELETE SOCKET:", message);

  const receiverId = String(message.receiver?._id || message.receiver);
  const senderId = String(message.sender?._id || message.sender);

  io.to(receiverId).emit("messageDeleted", message);
  io.to(senderId).emit("messageDeleted", message);
});

  // Disconnect
  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(
      (id) => onlineUsers[id] === socket.id
    );

    if (userId) {
      delete onlineUsers[userId];

      lastSeen[userId] = new Date();

      delete activeChats[userId];

      io.emit("onlineUsers", Object.keys(onlineUsers));
      io.emit("lastSeen", lastSeen);

      console.log("❌ User Disconnected:", userId);
    }
  });
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});