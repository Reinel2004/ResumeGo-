const express = require("express");
const router = express.Router();
const atsController = require("../controllers/ats.controller");
const authJwt = require("../middleware/authJwt");


router.post("/analyze", [authJwt.verifyToken], atsController.analyzeResume);
router.get("/score/:resumeId", [authJwt.verifyToken], atsController.getATSScore);
router.get("/keywords/:industry", atsController.getIndustryKeywords);
router.get("/test", atsController.testATS);

module.exports = router; 