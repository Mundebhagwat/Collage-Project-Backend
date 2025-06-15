const express = require("express");
const { registerUser, loginUser, getUserProfile, uploadProfilePicture } = require("../controllers/authController.js");
const { authMiddleware } = require("../middleware/jwtAuthentiaction.js");
const upload = require("../middleware/uploadMiddleware.js");
const { updatedUser, deleteUserlogged } = require("../controllers/userController.js")

const router = express.Router();

router.post("/register", upload.single("profilePicture"), registerUser);  // Register User
router.post("/login", loginUser);        // Login User
router.get("/me", authMiddleware, getUserProfile); // Get Logged-in User Profile
router.put("/update", authMiddleware, updatedUser);
router.delete("/delete", authMiddleware, deleteUserlogged);
router.post("/upload-profile-picture", authMiddleware, uploadProfilePicture);

module.exports = router;
