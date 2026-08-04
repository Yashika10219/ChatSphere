const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");


// ================= SIGNUP =================

const signup = async (req, res) => {
  try {

    const { name, email, password } = req.body;
    const profilePic = req.file
  ? `/uploads/${req.file.filename}`
  : "";

    console.log("Signup data:", req.body);


    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }


    const existingUser = await User.findOne({ email });


    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await User.create({
  name,
  email,
  password: hashedPassword,
  profilePic,
});


    res.status(201).json({
  message: "Signup successful",

  user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic,
},

  token: generateToken(user._id),
});


  } catch (error) {

    console.log("SIGNUP ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }
};





// ================= LOGIN =================

const login = async (req, res) => {

  try {

    const { email, password } = req.body;


    console.log("Login data:", email);


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }



    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );



    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }



    res.status(200).json({
  message: "Login successful",

  user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePic: user.profilePic,
},

  token: generateToken(user._id),
});



  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

};



module.exports = {
  signup,
  login
};