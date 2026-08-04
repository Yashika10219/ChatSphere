const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");
const upload = require("../middleware/upload");
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

router.post("/signup", upload.single("profilePic"), signup);
router.post("/login", login);

module.exports = router;