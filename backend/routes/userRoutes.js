const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUsers,
  updateProfile,
} = require("../controllers/userController");

const upload = require("../middleware/upload");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get All Users
router.get("/", getUsers);
// Update Profile
router.put(
  "/:id",
  upload.single("profilePic"),
  updateProfile
);

module.exports = router;