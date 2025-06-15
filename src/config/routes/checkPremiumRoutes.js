const express = require("express");
const { checkPremium } = require("../controllers/premiumCheck")
const { authMiddleware } = require("../middleware/jwtAuthentiaction");

const router = express.Router();

router.post("/check-premium-access", authMiddleware, checkPremium);

module.exports = router;
