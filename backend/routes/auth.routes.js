const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Auth routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/check-email", authController.checkEmail);

module.exports = router; 