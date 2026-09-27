import "./Chatbox.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContextValue";
import upload from "../../lib/upload";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const Chatbox = ({ setShowLeftSidebar }) => {
  const { userData, messagesId, chatUser, setMessages, messages } =
    useContext(AppContext);

  const [input, setInput] = useState("");
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsChatUserOnline(
        Boolean(chatUser?.lastSeen) && Date.now() - chatUser.lastSeen <= 30000,
      );
    };

    updateOnlineStatus();
    const statusInterval = window.setInterval(updateOnlineStatus, 1000);

    return () => window.clearInterval(statusInterval);
  }, [chatUser?.lastSeen]);

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

        // ---------------- SENDER CHAT DATA ----------------

        const senderChatsRef = doc(db, "chatData", userData.id);

        const senderChatsSnapshot = await getDoc(senderChatsRef);

        const senderChatItems = senderChatsSnapshot.exists()
          ? senderChatsSnapshot.data().chatData || []
          : [];

        const updatedSenderChatItems = senderChatItems.some(
          (chat) => chat.messageId === messagesId,
        )
          ? senderChatItems.map((chat) =>
              chat.messageId === messagesId
                ? {
                    ...chat,
                    lastMessage: messageText.slice(0, 30),
                    updatedAt: Date.now(),
                    messageSeen: true,
                  }
                : chat,
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

        // ---------------- RECEIVER CHAT DATA ----------------

        const receiverChatsRef = doc(db, "chatData", chatUser.id);

        const receiverChatsSnapshot = await getDoc(receiverChatsRef);

        const receiverChatItems = receiverChatsSnapshot.exists()
          ? receiverChatsSnapshot.data().chatData || []
          : [];

        const updatedReceiverChatItems = receiverChatItems.some(
          (chat) => chat.messageId === messagesId,
        )
          ? receiverChatItems.map((chat) =>
              chat.messageId === messagesId
                ? {
                    ...chat,
                    lastMessage: messageText.slice(0, 30),
                    updatedAt: Date.now(),
                    messageSeen: false,
                  }
                : chat,
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

  const sendImage = async (e) => {
    console.log("EVENT:", e);
    console.log("TARGET:", e.target);
    console.log("FILES:", e.target.files);

    const file = e.target.files?.[0];

    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("FILE:", file);

    try {
      const fileUrl = await upload(file);

      if (messagesId && userData?.id && chatUser?.id) {
        // ---------------- SAVE IMAGE MESSAGE ----------------

        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        // ---------------- SENDER CHAT DATA ----------------

        const senderChatsRef = doc(db, "chatData", userData.id);

        const senderChatsSnapshot = await getDoc(senderChatsRef);

        const senderChatItems = senderChatsSnapshot.exists()
          ? senderChatsSnapshot.data().chatData || []
          : [];

        const updatedSenderChatItems = senderChatItems.some(
          (chat) => chat.messageId === messagesId,
        )
          ? senderChatItems.map((chat) =>
              chat.messageId === messagesId
                ? {
                    ...chat,
                    lastMessage: "📷 Image",
                    updatedAt: Date.now(),
                    messageSeen: true,
                  }
                : chat,
            )
          : [
              ...senderChatItems,
              {
                messageId: messagesId,
                lastMessage: "📷 Image",
                rId: chatUser.id,
                updatedAt: Date.now(),
                messageSeen: true,
              },
            ];

        await updateDoc(senderChatsRef, {
          chatData: updatedSenderChatItems,
        });

        // ---------------- RECEIVER CHAT DATA ----------------

        const receiverChatsRef = doc(db, "chatData", chatUser.id);

        const receiverChatsSnapshot = await getDoc(receiverChatsRef);

        const receiverChatItems = receiverChatsSnapshot.exists()
          ? receiverChatsSnapshot.data().chatData || []
          : [];

        const updatedReceiverChatItems = receiverChatItems.some(
          (chat) => chat.messageId === messagesId,
        )
          ? receiverChatItems.map((chat) =>
              chat.messageId === messagesId
                ? {
                    ...chat,
                    lastMessage: "📷 Image",
                    updatedAt: Date.now(),
                    messageSeen: false,
                  }
                : chat,
            )
          : [
              ...receiverChatItems,
              {
                messageId: messagesId,
                lastMessage: "📷 Image",
                rId: userData.id,
                updatedAt: Date.now(),
                messageSeen: false,
              },
            ];

        await updateDoc(receiverChatsRef, {
          chatData: updatedReceiverChatItems,
        });
      }

      console.log("ImageKit URL:", fileUrl);
    } catch (error) {
      console.error("ImageKit upload error:", error);
      toast.error(error.message);
    }

    e.target.value = "";
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
        },
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
          {chatUser.name ||
            chatUser.username ||
            chatUser.email}

          {isChatUserOnline && (
            <img
              className="dot"
              src={assets.green_dot}
              alt=""
            />
          )}
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
            className={
              msg.sId === userData?.id
                ? "s-msg"
                : "r-msg"
            }
          >
            {msg.image ? (
              <img
                className="chat-image"
                src={msg.image}
                alt="sent"
              />
            ) : (
              <p className="msg">{msg.text}</p>
            )}

            <div className="message-info">
              <img
                className="message-avatar"
                src={
                  msg.sId === userData?.id
                    ? userData?.avatar ||
                      assets.profile_img
                    : chatUser?.avatar ||
                      assets.profile_img
                }
                alt=""
              />

              <p>
                {convertTimestamp(msg.createdAt)}
              </p>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <label htmlFor="image">
          <img
            src={assets.gallery_icon}
            alt=""
          />
        </label>

        <input
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
          onChange={(e) => sendImage(e)}
        />

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