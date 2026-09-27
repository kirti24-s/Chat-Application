import "./Chatbox.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContextValue";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";

const Chatbox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    setMessages,
    messages,
  } = useContext(AppContext);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      const messageText = input.trim();

      if (messageText && messagesId && userData?.id && chatUser?.id) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: messageText,
            createdAt: new Date(),
          }),
        });

        const senderChatsRef = doc(db, "chatData", userData.id);
        const senderChatsSnapshot = await getDoc(senderChatsRef);
        const senderChatItems = senderChatsSnapshot.exists()
          ? senderChatsSnapshot.data().chatData || []
          : [];

        const updatedSenderChatItems = senderChatItems.some(
          (chat) => chat.messageId === messagesId
        )
          ? senderChatItems.map((chat) =>
              chat.messageId === messagesId
                ? {
                    ...chat,
                    lastMessage: messageText.slice(0, 30),
                    updatedAt: Date.now(),
                    messageSeen: true,
                  }
                : chat
            )
          : [
              ...senderChatItems,
              {
                messageId: messagesId,
                lastMessage: messageText.slice(0, 30),
                rId: chatUser.id,
                updatedAt: Date.now(),
                messageSeen: true,
              },
            ];

        await updateDoc(senderChatsRef, {
          chatData: updatedSenderChatItems,
        });

        const receiverChatsRef = doc(db, "chatData", chatUser.id);
        const receiverChatsSnapshot = await getDoc(receiverChatsRef);
        const receiverChatItems = receiverChatsSnapshot.exists()
          ? receiverChatsSnapshot.data().chatData || []
          : [];

        const updatedReceiverChatItems = receiverChatItems.some(
          (chat) => chat.messageId === messagesId
        )
          ? receiverChatItems.map((chat) =>
              chat.messageId === messagesId
                ? {
                    ...chat,
                    lastMessage: messageText.slice(0, 30),
                    updatedAt: Date.now(),
                    messageSeen: false,
                  }
                : chat
            )
          : [
              ...receiverChatItems,
              {
                messageId: messagesId,
                lastMessage: messageText.slice(0, 30),
                rId: userData.id,
                updatedAt: Date.now(),
                messageSeen: false,
              },
            ];

        await updateDoc(receiverChatsRef, {
          chatData: updatedReceiverChatItems,
        });
      }
    } catch (error) {
      console.log(error.message);
    }

    setInput("");
  };

  const convertTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(
        doc(db, "messages", messagesId),
        (res) => {
          const data = res.data();

          if (!data) return;

          const messageList = data.messages || [];

          setMessages([...messageList].reverse());
        },
        (error) => {
          console.error("onSnapshot ERROR:", error);
        }
      );

      return () => {
        unSub();
      };
    }
  }, [messagesId, setMessages]);

  return chatUser ? (
    <div className="chat-box">

      <div className="chat-user">
        <img
          src={chatUser.avatar || assets.profile_img}
          alt=""
        />

        <p>
          {chatUser.name || chatUser.username || chatUser.email}
          <img
            className="dot"
            src={assets.green_dot}
            alt=""
          />
        </p>

        <img
          src={assets.help_icon}
          alt=""
        />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData?.id ? "s-msg" : "r-msg"}
          >
            <p className="msg">{msg.text}</p>

            <div>
              <img
                className="msg-img"
                src={
                  msg.sId === userData?.id
                    ? userData?.avatar || assets.profile_img
                    : chatUser?.avatar || assets.profile_img
                }
                alt=""
              />

              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />

        <input
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />

        <label htmlFor="image">
          <img
            src={assets.gallery_icon}
            alt=""
          />
        </label>

        <img
          onClick={sendMessage}
          src={assets.send_button}
          alt=""
        />
      </div>

    </div>
  ) : (
    <div className="chat-welcome">
      <img
        src={assets.logo_icon}
        alt=""
      />
      <p>Chat anytime, anywhere...</p>
    </div>
  );
};

export default Chatbox;