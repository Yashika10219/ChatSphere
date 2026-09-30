import { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "../socket";
import ProfilePicModal from "./ProfilePicModal";

export default function Sidebar({
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  onlineUsers,
  setOnlineUsers,
}) {

 
  const notificationSound = useRef(null);

useEffect(() => {
  notificationSound.current = new Audio("/notification.mp3");
  notificationSound.current.volume = 0.6;
}, []);
  const [lastMessages, setLastMessages] = useState({});
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  


  // SOCKET + ONLINE USERS
  useEffect(() => {
    if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

    if (currentUser?._id) {
      socket.emit(
  "join",
  currentUser._id
);
    }


    const handleOnlineUsers = (data) => {

      console.log("ONLINE USERS:", data);
setOnlineUsers(data);

    };


    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

   console.log("Sidebar onlineUsers:", onlineUsers);
    return () => {
      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );
    };


  }, []);



  // RECEIVE MESSAGE
  useEffect(() => {
    ;
   


    const handleNewMessage = (message) => {

  console.log("🔔 SIDEBAR RECEIVE:", message);
  console.log("👤 SENDER:", message.sender);
  console.log("📩 RECEIVER:", message.receiver);

  const senderId = String(
    message.sender?._id || message.sender
  );

  
      // Last message update
      setLastMessages((prev) => ({
        ...prev,
        [senderId]: message,
      }));



      // unread only if chat is not open
     if (
  senderId !== String(currentUser?._id) &&
  senderId !== String(selectedUser?._id)
) {

  console.log("🚨 NOTIFICATION FOR:", message);

  
  

  setUnread((prev) => ({
    ...prev,
    [senderId]: (prev[senderId] || 0) + 1,
  }));
  

}


      // move user to top
      setUsers((prev) => {

        const updated = [...prev];


        const index = updated.findIndex(
          (u) =>
            String(u._id) === senderId
        );


        if (index > -1) {

          const user =
            updated.splice(index, 1)[0];

          updated.unshift(user);

        }


        return updated;

      });


    };



    socket.on(
      "receiveMessage",
      handleNewMessage
    );



    return () => {

      socket.off(
        "receiveMessage",
        handleNewMessage
      );

    };


  }, [selectedUser]);
  useEffect(() => {
  console.log("Sidebar onlineUsers state:", onlineUsers);
}, [onlineUsers]);




  // LOAD USERS
  useEffect(() => {


    const loadUsers = async () => {


      try {


        const res = await axios.get(
          "https://chatsphere-1-8q32.onrender.com/api/users"
        );


        const filtered =
          res.data.filter(
            (user) =>
              String(user._id) !==
              String(currentUser?._id)
          );

      

        setUsers(filtered);
        

// ==============================
// CHECK UNREAD MESSAGES ON LOGIN
// ==============================
const unreadRes = await axios.get(
  `https://chatsphere-1-8q32.onrender.com/api/messages/unread/${currentUser._id}`
);

if (unreadRes.data.length > 0) {

  const unreadCount = {};

  unreadRes.data.forEach((msg)=>{

    const senderId = String(
      msg.sender?._id || msg.sender
    );

    unreadCount[senderId] =
      (unreadCount[senderId] || 0) + 1;

  });


  setUnread(unreadCount);


  notificationSound.current.currentTime = 0;

  notificationSound.current.play().catch((err)=>{
    console.log("🔇 LOGIN SOUND:", err);
  });

}

// ==============================
// LOAD LAST MESSAGES
// ==============================
filtered.forEach(async (user) => {
  try {
    const msg = await axios.get(
      `https://chatsphere-1-8q32.onrender.com/api/messages/last/${user._id}`
    );

    setLastMessages((prev) => ({
      ...prev,
      [user._id]: msg.data,
    }));
  } catch (err) {
    console.log(err);
  }
});



        // load last messages

        filtered.forEach(async (user) => {


          try {


            const msg = await axios.get(
              `https://chatsphere-1-8q32.onrender.com/api/messages/last/${user._id}`
            );


            setLastMessages((prev) => ({
              ...prev,
              [user._id]: msg.data,
            }));


          }
          catch(err) {

            console.log(err);

          }


        });




        // REMOVE THIS





      }
      catch(err) {

        console.log(err);

      }


    };



    

  loadUsers();  
  }, [currentUser?.email]);
   
  





  const filteredUsers =
    [...users]
      .filter((user) =>
        user.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
      .sort((a, b) => {


        const aTime =
          lastMessages[a._id]?.createdAt
          ?
          new Date(
            lastMessages[a._id].createdAt
          ).getTime()
          :
          0;


        const bTime =
          lastMessages[b._id]?.createdAt
          ?
          new Date(
            lastMessages[b._id].createdAt
          ).getTime()
          :
          0;


        return bTime - aTime;

      });





  return (

    <aside className="sidebar">


      <div className="sidebar-top">

        <div className="sidebar-brand">

          <div className="small-mark">
            💬
          </div>


          <div>

            <h2>
              ChatSphere
            </h2>


            <small>
              Realtime Messenger
            </small>


          </div>

        </div>

      </div>





      <div className="search-box">

        🔍


        <input

          type="text"

          placeholder="Search user..."

          value={search}

          onChange={(e)=>
            setSearch(e.target.value)
          }

        />


      </div>





      <div className="conversation-list">


        {
          filteredUsers.length === 0

          ?

          <p
            style={{
              color:"#94a3b8",
              textAlign:"center",
              marginTop:"30px"
            }}
          >
            No users found
          </p>


          :


          filteredUsers.map((user)=>(


            <button

              key={user._id}

              className={
                `conversation ${
                  selectedUser?._id === user._id
                  ?
                  "selected"
                  :
                  ""
                }`
              }


              onClick={() => {

  console.log("🔥 CLICKED USER:", user);

  setSelectedUser(user);

  setUnread((prev)=>({
    ...prev,
    [user._id]:0
  }));

}}


            >


              <div className="avatar violet">

  {
    user.profilePic
    ?
    <img
      src={`https://chatsphere-1-8q32.onrender.com${user.profilePic}`}
      alt="profile"
      className="profile-img"
    />
    :
    user.name
      .charAt(0)
      .toUpperCase()
  }

  <i
    className={
      onlineUsers.includes(
        String(user._id)
      )
      ?
      "online"
      :
      "offline"
    }
  ></i>

</div>





              <div className="conversation-copy">


                <span>


                  <div
                    style={{
                      display:"flex",
                      alignItems:"center",
                      gap:"8px"
                    }}
                  >


                    <strong>
                      {user.name}
                    </strong>



                    {
                      unread[user._id] > 0 &&

                      <span className="badge">

                        {unread[user._id]}

                      </span>

                    }


                  </div>



                  <time>

                    {
                      lastMessages[user._id]?.createdAt

                      ?

                      new Date(
                        lastMessages[user._id].createdAt
                      )
                      .toLocaleTimeString([],{

                        hour:"2-digit",
                        minute:"2-digit"

                      })

                      :

                      ""

                    }

                  </time>


                </span>





                <small>


                  {
                    lastMessages[user._id]?.text

                    ||

                    (
                      onlineUsers.includes(
                        String(user._id)
                      )

                      ?

                      "Online"

                      :

                      "Offline"

                    )
                  }


                </small>


              </div>



            </button>


          ))

        }


      </div>





      <div className="profile">


  <div className="avatar profile-avatar">

    {
      currentUser?.profilePic
      ?

      <img
  src={`https://chatsphere-1-8q32.onrender.com${currentUser.profilePic}`}
  alt="profile"
  className="profile-img"
/>

      :

      currentUser?.name
      ?.charAt(0)
      .toUpperCase()

    }

    <i className="online"></i>

  </div>


  <span>
    <strong>
      {currentUser?.name}
    </strong>
  </span>


 <button
  className="edit-profile"
  onClick={() => setShowProfileModal(true)}
>
  Edit Profile
</button>


  <button

    className="logout"

    onClick={() => {

      localStorage.clear();

      window.location.href="/login";

    }}

  >
    Logout
  </button>


</div>
{showProfileModal && (
  <ProfilePicModal
    onClose={() => setShowProfileModal(false)}
    onProfileUpdated={(updatedUser) => {
  setCurrentUser(updatedUser);
  localStorage.setItem(
    "user",
    JSON.stringify(updatedUser)
  );
  setShowProfileModal(false);
}}
  />
)}

    </aside>

  );

}