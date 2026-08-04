import { useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../socket";
import ChatInput from "./ChatInput";
import {
  Search,
  MoreVertical,
  Reply,
  Trash2
} from "lucide-react";


export default function ChatBox({
  selectedUser,
  setUsers,
  onlineUsers,
}) {


  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [lastSeen, setLastSeen] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  
  const [replyMessage, setReplyMessage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
const [searchText, setSearchText] = useState("");
const [showMoreMenu, setShowMoreMenu] = useState(false);
const [showProfile, setShowProfile] = useState(false);


  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);



  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
  const notificationSound = useRef(null);
  const deleteMessage = async (messageId) => {
  try {
    const res = await axios.patch(
      `http://localhost:5000/api/messages/${messageId}/delete`
    );
    socket.emit("deleteMessage", res.data);

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? res.data : msg
      )
    );
  } catch (err) {
    console.log(err);
  }
};




// 👇 YAHAN PASTE KARO
const deleteForMe = async (messageId) => {
  try {

    await axios.put(
      `http://localhost:5000/api/messages/delete-for-me/${messageId}`,
      {
        userId: currentUser._id
      }
    );

    setMessages((prev) =>
      prev.filter(
        (msg) => msg._id !== messageId
      )
    );

  } catch (err) {
    console.log(err);
  }
};
const clearChat = async () => {

  try {

    await axios.put(
      "http://localhost:5000/api/messages/clear-chat",
      {
        userId: currentUser._id,
        otherUserId: selectedUser._id
      }
    );

    setMessages([]);

    setShowMoreMenu(false);

  } catch (err) {

    console.log(err);

  }

};

useEffect(() => {
  notificationSound.current = new Audio("/notification.mp3");
  notificationSound.current.volume = 0.6;

  const unlockAudio = () => {
    notificationSound.current
      .play()
      .then(() => {
        notificationSound.current.pause();
        notificationSound.current.currentTime = 0;
        console.log("🔓 Audio Unlocked");
      })
      .catch((err) => {
        console.log("Unlock Error:", err);
      });

    document.removeEventListener("click", unlockAudio);
  };

  document.addEventListener("click", unlockAudio);

  return () => {
    document.removeEventListener("click", unlockAudio);
  };
}, []);



  // ==========================
  // TODAY / YESTERDAY LABEL
  // ==========================

  const getDateLabel = (date) => {


    const msgDate = new Date(date);


    const today = new Date();


    const yesterday = new Date();

    yesterday.setDate(
      today.getDate() - 1
    );



    const isSameDay = (d1,d2)=>


      d1.getDate() === d2.getDate() &&

      d1.getMonth() === d2.getMonth() &&

      d1.getFullYear() === d2.getFullYear();




    if(
      isSameDay(
        msgDate,
        today
      )
    ){

      return "Today";

    }



    if(
      isSameDay(
        msgDate,
        yesterday
      )
    ){

      return "Yesterday";

    }



    return "";

  };





  // ==========================
  // KEEP SELECTED USER UPDATED
  // ==========================

  useEffect(()=>{


    selectedUserRef.current =
      selectedUser;


  },[
    selectedUser
  ]);






  // ==========================
// SOCKET JOIN
// ==========================

useEffect(() => {

  console.log("CHATBOX CURRENT USER:", currentUser);

  if (!currentUser?._id) return;

  console.log("CHATBOX EMIT JOIN:", currentUser._id);

  socket.emit("join", currentUser._id);

}, [currentUser?._id]);
    // ==========================
  // SOCKET LISTENERS
  // ==========================

  useEffect(()=>{


    const receiveHandler = async (message)=>{

  console.log("✅ RECEIVE EVENT:", message);

  try{

    // DELIVERED

        // DELIVERED
        await axios.patch(
          `http://localhost:5000/api/messages/${message._id}/delivered`
        );


        socket.emit(
          "messageDelivered",
          message._id
        );
// AUTO SEEN IF CHAT IS OPEN
if(
  String(message.sender?._id || message.sender)
  ===
  String(selectedUserRef.current?._id)
  &&
  String(message.receiver?._id || message.receiver)
  ===
  String(currentUser._id)
){

  await axios.patch(
    `http://localhost:5000/api/messages/${message._id}/seen`
  );

  socket.emit(
    "messageSeen",
    message._id
  );

}
// SOUND NOTIFICATION

// SOUND NOTIFICATION
// SOUND NOTIFICATION
if (
  String(message.receiver) === String(currentUser._id) &&
  String(message.sender?._id || message.sender) !== 
  String(selectedUserRef.current?._id)
) {

  if(notificationSound.current){

  console.log("🔔 SOUND BLOCK EXECUTED");

  notificationSound.current.currentTime = 0;

  notificationSound.current.play()
    .then(()=>{
      console.log("✅ CHAT SOUND PLAYED");
    })
    .catch((err)=>{
      console.log("🔇 SOUND ERROR:", err);
    });

  }

}
        // NOTIFICATION

        if(
          Notification.permission === "granted" &&
          document.hidden &&
          String(message.receiver)
          ===
          String(currentUser._id)
        ){


          new Notification(
            message.sender?.name || "New Message",
            {
              body: message.text,

              icon:
              message.sender?.profilePic
              ?
              `http://localhost:5000${message.sender.profilePic}`
              :
              undefined
            }
          );


        }





        // ADD MESSAGE

        setMessages((prev)=>{


          const alreadyExist =
            prev.some(
              (msg)=>
                String(msg._id)
                ===
                String(message._id)
            );



          if(alreadyExist)
            return prev;



          return [
            ...prev,
            {
              ...message,
              sender:
              message.sender?._id ||
              message.sender
            }
          ];


        });



      }
      catch(err){

        console.log(err);

      }


    };







    // ==========================
    // TYPING
    // ==========================


    const typingHandler = (data)=>{


      if(
        String(data.receiver)
        ===
        String(currentUser._id)

        &&

        String(data.sender)
        ===
        String(selectedUserRef.current?._id)
      ){

        setTypingUser(
          data.sender
        );

      }


    };







    // ==========================
    // STOP TYPING
    // ==========================


    const stopTypingHandler = (data)=>{


      if(
        String(data.receiver)
        ===
        String(currentUser._id)

        &&

        String(data.sender)
        ===
        String(selectedUserRef.current?._id)
      ){

        setTypingUser("");

      }


    };







    // ==========================
    // DELIVERED UPDATE
    // ==========================


    const deliveredHandler = (messageId)=>{


      setMessages((prev)=>

        prev.map((msg)=>

          String(msg._id)
          ===
          String(messageId)

          ?

          {
            ...msg,
            status:"delivered"
          }

          :

          msg

        )

      );


    };







    // ==========================
    // SEEN UPDATE
    // ==========================


    const seenHandler = (messageId)=>{
      


      setMessages((prev)=>

        prev.map((msg)=>

          String(msg._id)
          ===
          String(messageId)

          ?

          {
            ...msg,
            status:"seen"
          }

          :

          msg

        )

      );


    };
    // ==========================
// DELETE UPDATE
// ==========================

const deleteHandler = (message) => {
  console.log("🗑 DELETE RECEIVED:", message);

  setMessages((prev) =>
    prev.map((msg) =>
      String(msg._id) === String(message._id)
        ? message
        : msg
    )
  );

};







    // ==========================
    // LAST SEEN
    // ==========================


    const lastSeenHandler = (data)=>{

      setLastSeen(data);

    };








    socket.on(
      "receiveMessage",
      receiveHandler
    );


    socket.on(
      "typing",
      typingHandler
    );


    socket.on(
      "stopTyping",
      stopTypingHandler
    );


    socket.on(
      "messageDelivered",
      deliveredHandler
    );


    socket.on(
      "messageSeen",
      seenHandler
    );
    socket.on(
  "messageDeleted",
  deleteHandler
);

    socket.on(
      "lastSeen",
      lastSeenHandler
    );







    return ()=>{


      socket.off(
        "receiveMessage",
        receiveHandler
      );


      socket.off(
        "typing",
        typingHandler
      );


      socket.off(
        "stopTyping",
        stopTypingHandler
      );


      socket.off(
        "messageDelivered",
        deliveredHandler
      );


      socket.off(
        "messageSeen",
        seenHandler
      );


      socket.off(
        "lastSeen",
        lastSeenHandler
      );


    };



  },[
    currentUser?._id
  ]);
    // ==========================
  // LOAD MESSAGES
  // ==========================

  useEffect(()=>{


    if(
      !selectedUser ||
      !currentUser?._id
    )
      return;



    const loadMessages = async()=>{


      try{
        const res = await axios.get(
  `http://localhost:5000/api/messages/${currentUser._id}/${selectedUser._id}`
);

setMessages(res.data);

for (const msg of res.data) {

  const fromSelectedUser =
    String(msg.sender?._id || msg.sender) === String(selectedUser._id);

  const toCurrentUser =
    String(msg.receiver?._id || msg.receiver) === String(currentUser._id);

  if (
    fromSelectedUser &&
    toCurrentUser &&
    msg.status === "delivered"
  ) {

    await axios.patch(
      `http://localhost:5000/api/messages/${msg._id}/seen`
    );

    socket.emit("messageSeen", msg._id);
  }
}


        



      }
      catch(err){

        console.log(err);

      }


    };



    loadMessages();



  },[
    selectedUser,
    currentUser?._id
  ]);














  // ==========================
  // AUTO SCROLL
  // ==========================

  useEffect(()=>{


    messagesEndRef.current?.scrollIntoView({
      behavior:"auto",
      block:"end"
    });



  },[
    messages
  ]);







  if(!selectedUser){


    return (

      <section className="chat-area">

        <div className="empty-chat">

          Select a user to start chatting 👋

        </div>

      </section>

    );


  }
  const filteredMessages = messages.filter((msg) =>
  msg.text?.toLowerCase().includes(searchText.toLowerCase())
);








  return (

<section
  className="chat-area"
  onClick={() => {
    setOpenMenu(null);
    setShowMoreMenu(false);
  }}
>
<div className="chat-header">

  <div className="chat-user">

    <img
      src={
        selectedUser.profilePic
          ? `http://localhost:5000${selectedUser.profilePic}`
          : "/default-avatar.png"
      }
      alt={selectedUser.name}
      className="chat-header-avatar"
    />

    <div>

      <h3>{selectedUser.name}</h3>

      <span>
        {String(typingUser) === String(selectedUser._id)
          ? "••• Typing..."
          : onlineUsers?.includes(String(selectedUser._id))
          ? "🟢 Online"
          : lastSeen[selectedUser._id]
          ? `Last seen ${new Date(
              lastSeen[selectedUser._id]
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Offline"}
      </span>

    </div>

  </div>

  <div className="chat-actions">
  <Search
  className="chat-icon"
  onClick={() => setShowSearch(!showSearch)}
/>
 <MoreVertical
  className="chat-icon"
  onClick={(e) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
  }}
/>
</div>
{showMoreMenu && (
  <div className="more-menu">
    <button
  onClick={() => {
    setShowMoreMenu(false);
    setShowProfile(true);
  }}
>
  👤 View Profile
</button>

    <button onClick={clearChat}>
  🧹 Clear Chat
</button>
  </div>
)}

</div>
{showSearch && (
  <div className="chat-search">
    <input
      type="text"
      placeholder="Search messages..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />
  </div>
)}









<div className="messages">


{
(searchText ? filteredMessages : messages).map((msg,index)=>{


const isSender =
String(msg.sender?._id || msg.sender)
===
String(currentUser._id);



const currentDate =
getDateLabel(msg.createdAt);



const previousDate =
index > 0
?
getDateLabel(messages[index-1].createdAt)
:
null;



return (

<div key={msg._id || index}>


{
currentDate !== previousDate &&
currentDate &&

(
<div className="date-divider">

<span>
{currentDate}
</span>

</div>
)

}



<div className="message-wrapper">


<div
className={
isSender
?
"message sent"
:
"message received"
}
>
  



<div className="message-text">
  {msg.replyTo && (
  <div className={
    isSender
    ? "reply-box reply-sent"
    : "reply-box reply-received"
  }>
    <strong>
      {isSender ? "You" : selectedUser.name}
    </strong>

    <p>
      {msg.replyTo.text}
    </p>
  </div>
)}


{msg.text && (

<div
style={{
fontStyle: msg.isDeleted ? "italic" : "normal",
color: msg.isDeleted ? "#888" : "inherit",
}}
>

{msg.text}

</div>

)}



{msg.file && (

<div className="message-file">


{msg.fileType?.includes("image") ? (

<img
src={`http://localhost:5000${msg.file}`}
alt="attachment"
className="chat-image"
/>

)

:

(

<a
href={`http://localhost:5000${msg.file}`}
target="_blank"
rel="noopener noreferrer"
className="file-link"
>

📄 Open File

</a>

)

}


</div>

)}


</div>





<div className="message-meta">


<span className="time">

{
new Date(msg.createdAt)
.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})
}

</span>




{
isSender && (

<span
className={

msg.status === "seen"

?

"tick seen"

:

msg.status === "delivered"

?

"tick delivered"

:

"tick sent"

}

>

{
msg.status === "sent"
?
"✔"
:
"✔✔"
}

</span>

)

}


</div>





{!msg.isDeleted && (

<div className="menu-container">


<button
  className="message-menu"
  onClick={(e) => {
    e.stopPropagation();

    setOpenMenu(
      openMenu === msg._id ? null : msg._id
    );
  }}
>
  <MoreVertical size={18}/>
</button>


{
openMenu === msg._id && (

<div
  className="message-actions"
  onClick={(e) => e.stopPropagation()}
>

<button
  className="reply-action"
  onClick={() => {
    setReplyMessage(msg);
    setOpenMenu(null);
  }}
>
  <Reply size={16} />
  <span>Reply</span>
</button>

{isSender && (
  <button
  className="delete-everyone"
  onClick={() => deleteMessage(msg._id)}
>
  <Trash2 size={16} />
  <span>Delete Everyone</span>
</button>
)}

<button
  className="delete-me"
  onClick={() => deleteForMe(msg._id)}
>
  <Trash2 size={16} />
  <span>Delete For Me</span>
</button>
</div>

)
}


</div>

)}


</div>


</div>


</div>


)
})
}
<div ref={messagesEndRef}/>


</div>
{showProfile && (
  <div className="profile-modal-overlay">
    <div className="profile-modal">

      <img
        src={
          selectedUser.profilePic
            ? `http://localhost:5000${selectedUser.profilePic}`
            : "/default-avatar.png"
        }
        alt={selectedUser.name}
        className="profile-modal-img"
      />

      <h2>{selectedUser.name}</h2>

      <p>
  <strong>About</strong>
  <br />
  {selectedUser.about || "Hey there! I'm using ChatSphere."}
</p>

      <button onClick={() => setShowProfile(false)}>
        Close
      </button>

    </div>
  </div>
)}


<ChatInput
selectedUser={selectedUser}
setUsers={setUsers}
setMessages={setMessages}
replyMessage={replyMessage}
setReplyMessage={setReplyMessage}
/>

</section>
);
}
