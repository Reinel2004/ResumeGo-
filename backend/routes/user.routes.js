const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authJwt = require("../middleware/authJwt");

// Get user profile
router.get("/profile", [authJwt.verifyToken], userController.getProfile);

// Update user profile
router.put("/profile", [authJwt.verifyToken], userController.updateProfile);

// Change password
router.post("/change-password", [authJwt.verifyToken], userController.changePassword);

module.exports = router; 