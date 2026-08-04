import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import "../styles/chat.css";

export default function Chat() {
  console.log("🔥 CHAT PAGE RUNNING");
  console.log("CHATBOX COMPONENT:", ChatBox);


  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );


  const [selectedUser, setSelectedUser] = useState(null);


  useEffect(() => {
    console.log(
      "🎯 SELECTED USER CHANGE:",
      selectedUser
    );
  }, [selectedUser]);

  
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  
    return (
  <div className="chat-container">

    <Sidebar
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      users={users}
      setUsers={setUsers}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      onlineUsers={onlineUsers}
      setOnlineUsers={setOnlineUsers}
    />


    <ChatBox
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      users={users}
      setUsers={setUsers}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      onlineUsers={onlineUsers}
      setOnlineUsers={setOnlineUsers}
    />

  </div>
);
}