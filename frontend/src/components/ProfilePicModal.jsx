import { useState } from "react";
import axios from "axios";
import "../styles/ProfilePicModal.css";

export default function ProfilePicModal({
  onClose,
  onProfileUpdated,
}) {
  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  console.log("CURRENT USER:", currentUser);

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(
    currentUser?.profilePic
      ? `https://chatsphere-1-8q32.onrender.com${currentUser.profilePic}`
      : ""
  );

const [loading, setLoading] = useState(false);

const [name, setName] = useState(
  currentUser?.name || ""
);

const [about, setAbout] = useState(
  currentUser?.about || ""
);

  const handleImage = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setImage(file);
  setPreview(URL.createObjectURL(file));
};

const uploadImage = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("name", name);
    formData.append("about", about);

    if (image) {
      formData.append("profilePic", image);
    }

    const res = await axios.put(
      `https://chatsphere-1-8q32.onrender.com/api/users/${currentUser._id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    localStorage.setItem(
      "user",
      JSON.stringify(res.data)
    );

    if (onProfileUpdated) {
      onProfileUpdated(res.data);
    }

    alert("Profile updated successfully.");
    onClose();

  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Update failed"
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">

        <h2>Profile Picture</h2>
        <input
  className="name-input"
  type="text"
  placeholder="Your name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

        <div className="profile-preview">
          {preview ? (
            <img
              src={preview}
              alt="preview"
            />
          ) : (
            <span>
              {currentUser.name
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>

       <label className="upload-btn">
  📷 Choose Image
  <input
    type="file"
    accept="image/*"
    onChange={handleImage}
    hidden
  />
</label>

{image && (
  <p className="file-name">
    {image.name}
  </p>
)}
<textarea
  className="about-input"
  placeholder="Write something about yourself..."
  value={about}
  onChange={(e) => setAbout(e.target.value)}
/>

        <div className="profile-buttons">

          <button
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={uploadImage}
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : "Save"}
          </button>

        </div>

      </div>
    </div>
  );
}