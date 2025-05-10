const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume.controller");
const authJwt = require("../middleware/authJwt");

// Resume routes
router.post("/", [authJwt.verifyToken], resumeController.create);
router.get("/", [authJwt.verifyToken], resumeController.findAll);
router.get("/:id", [authJwt.verifyToken], resumeController.findOne);
router.put("/:id", [authJwt.verifyToken], resumeController.update);

module.exports = router; 