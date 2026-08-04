import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: true,
  reconnection: true,
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("🚫 Socket Connection Error:", err.message);
});
socket.on("receiveMessage", (msg) => {
  console.log("🌍 GLOBAL RECEIVE:", msg);
});

export default socket;