// const express = require("express");
// const { authMiddleware } = require("../middleware/jwtAuthentiaction.js");
// const { shortlistProfile, sendRequest, acceptRequest } = require("../controllers/requestControllers.js");

// const router = express.Router();

// router.post("/shortlist/:id", authMiddleware, shortlistProfile); // Shortlist user
// router.post("/send-request/:id", authMiddleware, sendRequest); // Send request
// router.post("/accept-request/:id", authMiddleware, acceptRequest); // Accept request

// module.exports = router;



const express = require("express");
const { authMiddleware } = require("../middleware/jwtAuthentiaction.js");
const {
    shortlistProfile,
    sendRequest,
    acceptRequest,
    rejectRequest,  // ✅ Added reject request route
    getConnectionRequests // ✅ Added get connection requests route
} = require("../controllers/requestControllers.js");

const router = express.Router();

router.post("/shortlist/:id", authMiddleware, shortlistProfile);  // Shortlist user
router.post("/send-request/:id", authMiddleware, sendRequest);    // Send request
router.post("/accept-request/:id", authMiddleware, acceptRequest); // Accept request
router.post("/reject-request/:id", authMiddleware, rejectRequest); // ✅ Reject request
router.get("/connection-requests", authMiddleware, getConnectionRequests); // ✅ Get all received requests

module.exports = router;
