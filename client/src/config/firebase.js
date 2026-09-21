import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyAmvb93tNzyhKFmF5U_bbX_3CEPip_lvt4",
  authDomain: "chat-application-ef84f.firebaseapp.com",
  projectId: "chat-application-ef84f",
  storageBucket: "chat-application-ef84f.firebasestorage.app",
  messagingSenderId: "226802329657",
  appId: "1:226802329657:web:f8d7664e7e7b13655d05e8",
  measurementId: "G-FYMJGSGF1S",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      bio: "Hey, there! I am using Chat App.",
      avatar: "",
      lastSeen: Date.now(),
    });

    await setDoc(doc(db, "chatData", user.uid), {
      chatData: [],
    });

    return user;
  } catch (error) {
    console.error("Signup failed:", error);
    toast.error(error.message || "SignUp failed");
    throw error;
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(
      error.message|| "Login failed!",
    );
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(
      error.message || "Logout failed!",
    );
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Please enter your email first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    toast.success("Password reset email sent!");
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);
    toast.error(error.message);
  }
};
export { analytics, auth, db, storage, signup, login, logout,resetPass };
