import "./LeftSidebar.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { auth, db, logout } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContextValue";

const getCurrentTime = () => Date.now();

const LeftSidebar = ({ setShowLeftSidebar }) => {
  const navigate = useNavigate();

  const { chatData, setChatUser, setMessagesId } = useContext(AppContext);

  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Stores latest message for each chat
  const [latestMessages, setLatestMessages] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));

        setUsers(
          usersSnapshot.docs.map((userDoc) => ({
            id: userDoc.id,
            ...userDoc.data(),
          })),
        );
      } catch (error) {
        console.error("Could not load users:", error);
        setSearchError("Could not load users. Check your Firebase connection.");
      }
    };

    loadUsers();
  }, []);

  // Listen to every existing chat and get its latest message
  useEffect(() => {
    if (!chatData || chatData.length === 0) {
      setLatestMessages({});
      return;
    }

    const unsubscribers = [];

    chatData.forEach((chat) => {
      if (!chat.messageId) return;

      const messageRef = doc(db, "messages", chat.messageId);

      const unsubscribe = onSnapshot(
        messageRef,
        (snapshot) => {
          if (!snapshot.exists()) return;

          const data = snapshot.data();
          const messages = data.messages || [];

          if (messages.length === 0) {
            setLatestMessages((prev) => ({
              ...prev,
              [chat.messageId]: "",
            }));
            return;
          }

          // Get the latest message
          const latestMessage = messages[messages.length - 1];

          let preview = "";

          if (latestMessage.image) {
            preview = "📷 Image";
          } else if (latestMessage.text) {
            preview = latestMessage.text;
          }

          setLatestMessages((prev) => ({
            ...prev,
            [chat.messageId]: preview,
          }));
        },
        (error) => {
          console.error("Error listening to messages:", chat.messageId, error);
        },
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [chatData]);

  const handleLogout = async () => {
    await logout();
  };

  const inputHandler = async (e) => {
    const input = e.target.value.trim().toLowerCase();

    if (input) {
      setShowSearch(Boolean(input));
      setSearchResults([]);
      setSearchError("");
    } else {
      setShowSearch(false);
      return;
    }

    try {
      console.log("Searching for username:", input);

      const results = users.filter((userData) =>
        [userData.username, userData.name, userData.email]
          .filter(Boolean)
          .some(
            (value) =>
              String(value).toLowerCase().includes(input) &&
              auth.currentUser?.uid !== userData.id,
          ),
      );

      console.log("Search results:", results.length);
      setSearchResults(results);
    } catch (error) {
      console.error("User search failed:", error);
      setSearchError("Could not search users. Check your Firebase connection.");
    }
  };

  const addChat = async (selectedUser) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !selectedUser?.id) {
        console.log("Missing current user or selected user");
        return null;
      }

      const currentChatRef = doc(db, "chatData", currentUser.uid);
      const receiverChatRef = doc(db, "chatData", selectedUser.id);

      const [currentChatSnapshot, receiverChatSnapshot] = await Promise.all([
        getDoc(currentChatRef),
        getDoc(receiverChatRef),
      ]);

      const currentChatData = currentChatSnapshot.exists()
        ? currentChatSnapshot.data().chatData || []
        : [];

      const receiverChatData = receiverChatSnapshot.exists()
        ? receiverChatSnapshot.data().chatData || []
        : [];

      const existingCurrentChat = currentChatData.find(
        (item) => item.rId === selectedUser.id,
      );

      const existingReceiverChat = receiverChatData.find(
        (item) => item.rId === currentUser.uid,
      );

      const existingMessageId =
        existingCurrentChat?.messageId || existingReceiverChat?.messageId;

      if (existingMessageId) {
        const updatedCurrentChatData = currentChatData.some(
          (item) => item.rId === selectedUser.id,
        )
          ? currentChatData.map((item) =>
              item.rId === selectedUser.id
                ? { ...item, messageId: existingMessageId }
                : item,
            )
          : [
              ...currentChatData,
              {
                messageId: existingMessageId,
                lastMessage: "",
                rId: selectedUser.id,
                updatedAt: getCurrentTime(),
                messageSeen: true,
              },
            ];

        const updatedReceiverChatData = receiverChatData.some(
          (item) => item.rId === currentUser.uid,
        )
          ? receiverChatData.map((item) =>
              item.rId === currentUser.uid
                ? { ...item, messageId: existingMessageId }
                : item,
            )
          : [
              ...receiverChatData,
              {
                messageId: existingMessageId,
                lastMessage: "",
                rId: currentUser.uid,
                updatedAt: getCurrentTime(),
                messageSeen: false,
              },
            ];

        await Promise.all([
          setDoc(
            currentChatRef,
            { chatData: updatedCurrentChatData },
            { merge: true },
          ),
          setDoc(
            receiverChatRef,
            { chatData: updatedReceiverChatData },
            { merge: true },
          ),
        ]);

        console.log("Reused existing chat:", existingMessageId);
        return existingMessageId;
      }

      const newMessageRef = doc(collection(db, "messages"));

      await setDoc(newMessageRef, {
        messages: [],
      });

      const now = getCurrentTime();

      const currentChatEntry = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: selectedUser.id,
        updatedAt: now,
        messageSeen: true,
      };

      const receiverChatEntry = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: currentUser.uid,
        updatedAt: now,
        messageSeen: true,
      };

      await Promise.all([
        setDoc(
          currentChatRef,
          {
            chatData: [...currentChatData, currentChatEntry],
          },
          { merge: true },
        ),
        setDoc(
          receiverChatRef,
          {
            chatData: [...receiverChatData, receiverChatEntry],
          },
          { merge: true },
        ),
      ]);

      console.log("Chat created:", newMessageRef.id);

      return newMessageRef.id;
    } catch (error) {
      console.log("ADD CHAT ERROR:", error.message);
      return null;
    }
  };

  const setChat = async (user) => {
    console.log("Clicked user:", user);
    console.log("Current chatData:", chatData);

    const currentUser = auth.currentUser;
    const currentChatData = chatData || [];

    const existingChat = currentChatData.find((item) => item.rId === user.id);

    if (existingChat) {
      console.log("Existing chat:", existingChat);

      if (existingChat.messageSeen === false) {
        const currentChatRef = doc(db, "chatData", currentUser.uid);
        const updatedChatData = currentChatData.map((item) =>
          item.messageId === existingChat.messageId
            ? { ...item, messageSeen: true }
            : item,
        );

        await updateDoc(currentChatRef, { chatData: updatedChatData });
      }

      setMessagesId(existingChat.messageId);
      setChatUser(user);
      return;
    }

    if (currentUser && user?.id) {
      const currentChatRef = doc(db, "chatData", currentUser.uid);
      const selectedUserChatRef = doc(db, "chatData", user.id);

      const [currentChatSnapshot, selectedUserChatSnapshot] = await Promise.all(
        [getDoc(currentChatRef), getDoc(selectedUserChatRef)],
      );

      const currentItems = currentChatSnapshot.exists()
        ? currentChatSnapshot.data().chatData || []
        : [];

      const selectedItems = selectedUserChatSnapshot.exists()
        ? selectedUserChatSnapshot.data().chatData || []
        : [];

      const matchingChat =
        currentItems.find((item) => item.rId === user.id) ||
        selectedItems.find((item) => item.rId === currentUser.uid);

      if (matchingChat) {
        setMessagesId(matchingChat.messageId);
        setChatUser(user);
        return;
      }
    }

    console.log("No chat found. Creating new chat...");

    const newMessagesId = await addChat(user);

    if (newMessagesId) {
      setMessagesId(newMessagesId);
    }

    setChatUser(user);
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />

          {/* MOBILE CLOSE BUTTON */}
          <button
            type="button"
            className="close-sidebar"
            onClick={() => {
              setShowLeftSidebar(false);
            }}
          >
            ✕
          </button>

          <div className="menu">
            <img src={assets.menu_icon} alt="" />

            <div className="sub-menu">
              <button type="button" onClick={() => navigate("/profile")}>
                Edit Profile
              </button>

              <hr />

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="ls-search">
          <img src={assets.search_icon} alt="" />

          <input
            type="text"
            onChange={inputHandler}
            placeholder="Search here.."
          />
        </div>
      </div>

      <div className="ls-list">
        {showSearch &&
          searchResults.length > 0 &&
          searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => setChat(user)}
              className={`friends ${
                chatData?.find((item) => item.rId === user.id)?.messageSeen ===
                false
                  ? "border"
                  : ""
              }`}
            >
              <img src={user.avatar || assets.profile_img} alt="" />

              <p>{user.name || user.username}</p>
              <span>
                {user.lastMessage?.image
                  ? "📷 Image"
                  : user.lastMessage?.text || user.lastMessage || ""}
              </span>
            </div>
          ))}

        {showSearch && searchResults.length === 0 && (
          <p className="search-empty">
            {searchError || "No other users found"}
          </p>
        )}

        {!showSearch &&
          users
            .filter(
              (userData) =>
                auth.currentUser?.uid !== userData.id &&
                chatData?.some((chat) => chat.rId === userData.id),
            )
            .map((user) => {
              const chat = chatData?.find((item) => item.rId === user.id);

              return (
                <div
                  key={user.id}
                  onClick={() => setChat(user)}
                  className={`friends ${
                    chat?.messageSeen === false ? "border" : ""
                  }`}
                >
                  <img src={user.avatar || assets.profile_img} alt="" />

                  <div>
                    <p>{user.name || user.username || user.email}</p>

                    <span>
                      {chat?.messageId
                        ? latestMessages[chat.messageId] || ""
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
      </div>

      <div></div>
    </div>
  );
};

export default LeftSidebar;
