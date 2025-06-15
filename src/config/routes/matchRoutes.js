const express = require("express");
const { authMiddleware } = require("../middleware/jwtAuthentiaction.js");
const getMatches = require("../controllers/matchController.js");

const router = express.Router();

router.get("/matches", authMiddleware, getMatches); // Fetch suggested matches

module.exports = router;
