const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Auth routes
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/check-email", authController.checkEmail);

// Password reset routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/validate-reset-token/:token", authController.validateResetToken);

// Email verification routes
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);

module.exports = router; 