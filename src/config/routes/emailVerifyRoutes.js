const express = require("express");

const emailVerify = require("../controllers/emailVerifiactionController");

const router = express.Router();

router.get("/verify-email", emailVerify);

module.exports = router;