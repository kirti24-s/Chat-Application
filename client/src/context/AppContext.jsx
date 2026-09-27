import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { auth, db } from "../config/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "./AppContextValue";

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const loadUserData = useCallback(
    async (uid) => {
      try {
<<<<<<< HEAD
        // console.log("Trying to load UID:", uid);
=======
        console.log("Trying to load UID:", uid);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

<<<<<<< HEAD
        // console.log("userSnap:", userSnap);
=======
        console.log("userSnap:", userSnap);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

        if (!userSnap.exists()) {
          console.log("No user document found for UID:", uid);

          if (location.pathname !== "/profile") {
            navigate("/profile");
          }

          return;
        }

        const data = userSnap.data();
        setUserData(data);

        const chatRef = doc(db, "chatData", uid);

<<<<<<< HEAD
        // console.log("Authenticated UID:", auth.currentUser?.uid);
        // console.log("Chat document path:", chatRef.path);
=======
        console.log("Authenticated UID:", auth.currentUser?.uid);
        console.log("Chat document path:", chatRef.path);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
          await setDoc(chatRef, { chatData: [] });
<<<<<<< HEAD
          // console.log("Created chat document:", chatRef.path);
        }

        // console.log("userData:", data);
=======
          console.log("Created chat document:", chatRef.path);
        }

        console.log("userData:", data);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

        if (location.pathname === "/") {
          navigate(
            data.avatar && data.username ? "/chat" : "/profile"
          );
        }
      } catch (error) {
<<<<<<< HEAD
        // console.error("User data or chat setup failed:", error);
=======
        console.error("User data or chat setup failed:", error);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f
      }
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    if (!userData?.id || !auth.currentUser) {
      setChatData(null);
      return;
    }

    const uid = userData.id;

    const chatRef = doc(db, "chatData", uid);

<<<<<<< HEAD
    // console.log("Starting chat listener:", {
    //   uid,
    //   path: chatRef.path,
    // });

    // console.log("Listening to chat document:", chatRef.path);
=======
    console.log("Starting chat listener:", {
      uid,
      path: chatRef.path,
    });

    console.log("Listening to chat document:", chatRef.path);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

    const unsubscribe = onSnapshot(
      chatRef,
      async (snapshot) => {
        const chatItems = snapshot.exists()
          ? snapshot.data().chatData || []
          : [];

<<<<<<< HEAD
        // console.log("Chat document snapshot:", snapshot.data());
        // console.log("Chat items:", chatItems);
=======
        console.log("Chat document snapshot:", snapshot.data());
        console.log("Chat items:", chatItems);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f

        const enrichedChatData = [];

        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);

          enrichedChatData.push({
            ...item,
            userData: userSnap.exists()
              ? userSnap.data()
              : null,
          });
        }

        enrichedChatData.sort(
          (a, b) => b.updatedAt - a.updatedAt
        );

        setChatData(enrichedChatData);

<<<<<<< HEAD
        // console.log(
        //   "Loaded chat data:",
        //   enrichedChatData
        // );
=======
        console.log(
          "Loaded chat data:",
          enrichedChatData
        );
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f
      },
      (error) => {
        console.error("Chat listener failed:", {
          code: error.code,
          message: error.message,
          uid,
          path: chatRef.path,
        });
      }
    );

    return () => {
<<<<<<< HEAD
      // console.log("Stopping chat listener:", chatRef.path);
=======
      console.log("Stopping chat listener:", chatRef.path);
>>>>>>> c5c588d1de05563f11201b773241d33db56ad39f
      unsubscribe();
    };
  }, [userData]);

  const value = useMemo(
    () => ({
      userData,
      setUserData,

      chatData,
      setChatData,

      loadUserData,

      messages,
      setMessages,

      messagesId,
      setMessagesId,

      chatUser,
      setChatUser,
    }),
    [
      userData,
      chatData,
      loadUserData,
      messages,
      messagesId,
      chatUser,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;