// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { getAllUsers, toggleBlockUser, verifyUser, getModerationQueue, approveModeration, rejectModeration } = require("../controllers/adminController");
const { authMiddleware, adminMiddleware } = require("../middleware/jwtAuthentiaction");

// GET all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// PATCH toggle user block/unblock (admin only)
router.patch("/users/:userId/block", authMiddleware, adminMiddleware, toggleBlockUser);

// PATCH /api/admin/users/:userId/verify
router.patch("/users/:userId/verify", authMiddleware, adminMiddleware, verifyUser);


module.exports = router;
