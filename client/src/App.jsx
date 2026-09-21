import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "./config/firebase";
import { db } from "./config/firebase";
import {AppContext} from "./context/AppContextValue";

const App = () => {
  const navigate = useNavigate();
  const {loadUserData} = useContext(AppContext);

  useEffect(() => {
    let heartbeat;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const updateLastSeen = () =>
          setDoc(doc(db, "users", user.uid), { lastSeen: Date.now() }, { merge: true });

        await updateLastSeen();
        heartbeat = window.setInterval(updateLastSeen, 10000);
        await loadUserData(user.uid);
      } else {
        window.clearInterval(heartbeat);
        navigate('/');
      }
    });

    return () => {
      unsubscribe();
      window.clearInterval(heartbeat);
    };
  }, [loadUserData, navigate]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  );
};

export default App;
