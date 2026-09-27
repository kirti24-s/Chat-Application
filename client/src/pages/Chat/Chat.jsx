import "./Chat.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import Chatbox from "../../components/Chatbox/Chatbox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContextValue";

const Chat = () => {
  const { userData } = useContext(AppContext);

  // Left sidebar is visible when mobile chat opens
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);

  return (
    <div className="chat">
      <div className="chat-container">

        {/* LEFT SIDEBAR */}
        <div
          className={
            showLeftSidebar
              ? "left-sidebar left-sidebar-show"
              : "left-sidebar"
          }
        >
          <LeftSidebar
            setShowLeftSidebar={setShowLeftSidebar}
          />
        </div>

        {/* CHATBOX */}
        <Chatbox
          setShowLeftSidebar={setShowLeftSidebar}
        />

        {/* RIGHT SIDEBAR */}
        <RightSidebar />

      </div>
    </div>
  );
};

export default Chat;