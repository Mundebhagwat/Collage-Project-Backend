const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/jwtAuthentiaction");
const { reportUser, getAllReports, dismissReport } = require("../controllers/reportController");

// Report a user
router.post("/:userId", authMiddleware, reportUser);

// GET: Fetch all reports (Admin only)
router.get("/", authMiddleware, adminMiddleware, getAllReports);

// DELETE: Dismiss a report (Admin only)
router.delete("/:reportId", authMiddleware, adminMiddleware, dismissReport);

module.exports = router;
