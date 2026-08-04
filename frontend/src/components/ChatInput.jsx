import { useState, useRef } from "react";
console.log("🔥 ChatInput Loaded");
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import socket from "../socket";
import { FiSend } from "react-icons/fi";
export default function ChatInput({
 selectedUser,
 setUsers,
 setMessages,
 replyMessage,
 setReplyMessage
}){

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
 const fileInputRef = useRef(null);
const typingTimeout = useRef(null);
  const currentUser = JSON.parse(
  localStorage.getItem("user")
) || {};
  console.log("USER ID:", currentUser?._id);

console.log("FULL USER:", JSON.stringify(currentUser, null, 2));
const onEmojiClick = (emojiData) => {
  setText((prev) => prev + emojiData.emoji);
};

  const sendMessage = async () => {
    console.log("🔥 BUTTON CLICKED");

  console.log("🚀 sendMessage called");

 if (!text.trim() && !selectedFile) {
  console.log("❌ Nothing to send");
  return;
}

  if (!selectedUser?._id) {
    console.log("❌ No selected user");
    return;
  }

  try {

     const formData = new FormData();
     if(replyMessage){
  formData.append(
    "replyTo",
    replyMessage._id
  );
}

formData.append("sender", currentUser._id);
formData.append("receiver", selectedUser._id);
formData.append("text", text);

if (selectedFile) {
  formData.append("file", selectedFile);
}
console.log("📤 Sending FormData");

for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}

const res = await axios.post(
  "http://localhost:5000/api/messages",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);


      const savedMessage = res.data;


      console.log(
        "MESSAGE SAVED:",
        savedMessage
      );



     setMessages((prev)=>[
  ...prev,
  {
    ...savedMessage,
    sender:
      savedMessage.sender?._id || savedMessage.sender
  }
]);


console.log("EMITTING SEND:", savedMessage);
      socket.emit(
        "sendMessage",
        savedMessage
      );



      setUsers((prev)=>{

        const updated = [...prev];


        const index = updated.findIndex(
          (u)=>
            String(u._id) ===
            String(selectedUser._id)
        );


        if(index !== -1){

          const user =
            updated.splice(index,1)[0];

          updated.unshift(user);

        }


        return updated;

      });




      setText("");
      setSelectedFile(null);



    }
    catch(err){

      console.error(
        "SEND ERROR:",
        err
      );

    }

  };






  const handleTyping = (e)=>{


    console.log(
      "HANDLE TYPING CALLED"
    );


    const value = e.target.value;


    setText(value);



    if(!selectedUser?._id) return;



    const typingData = {

      sender: currentUser._id,

      receiver: selectedUser._id,

    };



    console.log(
      "EMITTING TYPING",
      typingData
    );



    socket.emit(
      "typing",
      typingData
    );





    if(typingTimeout.current){

      clearTimeout(
        typingTimeout.current
      );

    }





    typingTimeout.current =
      setTimeout(()=>{


        console.log(
          "STOP TYPING SENT"
        );


        socket.emit(
          "stopTyping",
          typingData
        );


      },2000);



  };






  return (
  <div className="chat-input">

    {showEmoji && (
      <div className="emoji-picker">
        <EmojiPicker
          onEmojiClick={onEmojiClick}
        />
      </div>
    )}
    {replyMessage && (
  <div className="reply-preview">

    <div>
      <strong>
        ↩ Replying to {replyMessage.sender?.name || "message"}
      </strong>

      <p>
        {replyMessage.text || "📎 Attachment"}
      </p>
    </div>

    <button
      onClick={() => setReplyMessage(null)}
    >
      ✕
    </button>

  </div>
)}
    <button
      className="emoji-btn"
      onClick={() => setShowEmoji(!showEmoji)}
    >
      😀
    </button>
    <button
  className="attach-btn"
  onClick={() => fileInputRef.current.click()}
>
  📎
</button>

<input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  onChange={(e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      console.log("📎 Selected File:", e.target.files[0]);
    }
  }}
/>


    <input
      type="text"
      value={text}
      onChange={handleTyping}
      placeholder="Type a message..."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage();
        }
      }}
    />


    <button
  className="send-btn"
  onClick={() => {
    console.log("🔥 SEND BUTTON CLICKED");
    sendMessage();
  }}
>
  <FiSend />
</button>

  </div>
);
}