import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import "../styles/chat.css";

export default function Chat() {
  return (
    <div className="chat-container">
      <Sidebar />
      <ChatBox />
    </div>
  );
}