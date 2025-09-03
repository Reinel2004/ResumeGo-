const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const authJwt = require("../middleware/authJwt");

// Get user profile
router.get("/profile", [authJwt.verifyToken], userController.getProfile);

// Update user profile
router.put("/profile", [authJwt.verifyToken], userController.updateProfile);

// Change password
router.post("/change-password", [authJwt.verifyToken], userController.changePassword);

// Update user account information (for account settings)
router.put("/update", [authJwt.verifyToken], authController.updateUser);

module.exports = router; 