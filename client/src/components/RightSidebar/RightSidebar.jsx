import "./RightSidebar.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { logout } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContextValue";

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

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return chatUser ? (
    <div className="rs">
      <div className="chat-profile">
        <img src={chatUser.avatar} alt="" />
        <h3>
          {chatUser.name}
        <p>{Date.now()-chatUser.lastSeen <= 70000 ? <img className="dot" src={assets.green_dot} alt="" />:null }</p> 
        </h3>
        <p>{chatUser.bio} </p>
      </div>
      <hr />

      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url,index) => (<img onclick={() => Window.open(url)} key={index} src ={url} alt='' />))}
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
