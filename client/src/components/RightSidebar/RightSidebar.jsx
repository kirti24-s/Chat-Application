import "./RightSidebar.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { logout } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContextValue";

<<<<<<< HEAD
const RightSidebar = (setShowRightSidebar) => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState("");

  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);
=======
const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
const [msgImages, setMsgImages] = useState("");

useEffect(() => {
  let tempVar = [];
  messages.map((msg) => {
    if(msg.image){
      tempVar.push(msg.image);
    }
  })
  setMsgImages(tempVar);
},[messages])
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return chatUser ? (
    <div className="rs">
<<<<<<< HEAD
      <button
        type="button"
        className="close-right-sidebar"
        onClick={() => setShowRightSidebar(false)}
      >
        ✕
      </button>
      
=======
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f
      <div className="chat-profile">
        <img src={chatUser.avatar} alt="" />
        <h3>
          {chatUser.name}
<<<<<<< HEAD
          <p>
            {Date.now() - chatUser.lastSeen <= 70000 ? (
              <img className="dot" src={assets.green_dot} alt="" />
            ) : null}
          </p>
=======
        <p>{Date.now()-chatUser.lastSeen <= 70000 ? <img className="dot" src={assets.green_dot} alt="" />:null }</p> 
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f
        </h3>
        <p>{chatUser.bio} </p>
      </div>
      <hr />

      <div className="rs-media">
        <p>Media</p>
        <div>
<<<<<<< HEAD
          {msgImages.map((url, index) => (
            <img
              onclick={() => Window.open(url)}
              key={index}
              src={url}
              alt=""
            />
          ))}
=======
          {msgImages.map((url,index) => (<img onclick={() => Window.open(url)} key={index} src ={url} alt='' />))}
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f
        </div>
      </div>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  ) : (
    <div className="rs">
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
