const express = require("express");
const { authMiddleware } = require("../middleware/jwtAuthentiaction");
const { getMessages, sendMessage } = require("../controllers/messageControllers");

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, getMessages);

module.exports = router;