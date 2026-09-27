import { auth } from "../config/firebase";

const upload = async (file) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to upload a profile image.");
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
  const authResponse = await fetch(`${serverUrl}/api/imagekit-auth`);
  if (!authResponse.ok) {
    throw new Error("Could not connect to the ImageKit server.");
  }

  const authentication = await authResponse.json();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", `${user.uid}-${Date.now()}-${file.name}`);
  formData.append("folder", "/profile-images");
  formData.append("publicKey", authentication.publicKey);
  formData.append("signature", authentication.signature);
  formData.append("expire", authentication.expire);
  formData.append("token", authentication.token);

  const uploadResponse = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await uploadResponse.json();

  console.log("ImageKit response:", result);
  console.log("Image URL:", result.url);

  if (!uploadResponse.ok || !result.url) {
    throw new Error(result.message || "ImageKit could not upload the image.");
  }

  return result.url;
};

export default upload;
