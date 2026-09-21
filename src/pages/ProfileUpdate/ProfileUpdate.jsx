import { useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ProfileUpdate = () => {
  const navigate = useNavigate();

  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const profileUpdate = async (e) => {
    e.preventDefault();

    // Check name and bio
    if (!name.trim() || !bio.trim()) {
      toast.error("Please fill name and bio!");
      return;
    }

    // Check profile picture
    if (!image && !prevImage) {
      toast.error("Please upload profile picture!");
      return;
    }

    let toastId;
    try {
      setIsSaving(true);
      toastId = toast.loading("Saving your profile...");
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Please sign in again before updating your profile.");
      }

       // 1. Keep the previous image URL
    let imageUrl = prevImage;

    // 2. If user selected a NEW image, upload it to ImageKit
    if (image) {
      imageUrl = await upload(image);
    }

      const profileData = {
        name: name.trim(),
        username: name.trim().toLowerCase(),
        bio: bio.trim(),
        avatar: imageUrl
      };

       // 4. Save profile data in Firestore
    const docRef = doc(db, "users", user.uid);

      await setDoc(docRef, profileData, { merge: true });
      await updateProfile(user, {
        displayName: name.trim(),
        photoURL: imageUrl,
      });

      toast.update(toastId, {
        render: "Profile updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      navigate("/chat");

    } catch (error) {
      console.log(error);
      if (toastId) {
        toast.update(toastId, {
          render: error.message || "Could not update your profile.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.error(error.message || "Could not update your profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.name) {
            setName(data.name);
          }

          if (data.bio) {
            setBio(data.bio);
          }

          if (data.avatar) {
            setPrevImage(data.avatar);
          }
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="profile">
      <div className="profile-container">

        <form onSubmit={profileUpdate}>

          <h3>Profile Details</h3>

          <label htmlFor="avatar">

            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />

            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage
                  ? prevImage
                  : assets.avatar_icon
              }
              alt=""
            />

            <span>Upload profile image</span>

          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>

        </form>

        <img
          className="profile-pic"
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage
              ? prevImage
              : assets.logo_icon
          }
          alt=""
        />

      </div>
    </div>
  );
};

export default ProfileUpdate;
