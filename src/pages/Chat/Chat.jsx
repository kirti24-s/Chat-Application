import "./Chat.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import Chatbox from "../../components/Chatbox/Chatbox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { useContext } from "react";
import { AppContext } from "../../context/AppContextValue";

const Chat = () => {
  const { userData } = useContext(AppContext);

  console.log("User data:", userData);

  return (
    <div className="chat">
      {!userData ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="chat-container">
          <LeftSidebar />
          <Chatbox />
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chat;