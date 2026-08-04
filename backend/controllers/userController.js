const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ==============================
// Register User
// ==============================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic,
  about: user.about,
  token: generateToken(user._id),
});

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Login User
// ==============================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      user &&
      (await bcrypt.compare(password, user.password))
    ) {
      return res.status(200).json({
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic,
  about: user.about,
  token: generateToken(user._id),
});
    }

    res.status(401).json({
      message: "Invalid email or password",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// Get All Users
// ==============================

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ==============================
// Update Profile
// ==============================

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
    }
    if (req.body.about) {
  updateData.about = req.body.about;
}

    if (req.file) {
      updateData.profilePic = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// ==============================
// EXPORTS
// ==============================

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateProfile,
};