const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resume.controller");
const authJwt = require("../middleware/authJwt");
const db = require('../models'); // or require your mysql2/mysql connection directly if not using Sequelize

// Resume routes
router.post("/", [authJwt.verifyToken], resumeController.create);
router.get("/", [authJwt.verifyToken], resumeController.findAll);
router.get("/:id", [authJwt.verifyToken], resumeController.findOne);
router.put("/:id", [authJwt.verifyToken], resumeController.update);
router.delete("/:id", [authJwt.verifyToken], resumeController.delete);

// Save resume using raw MySQL
router.post('/save-resume', [authJwt.verifyToken], (req, res) => {
    const { title, template, content } = req.body;
    const userId = req.userId; // set by authJwt middleware

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const resumeData = JSON.stringify(content);
    const sql = `INSERT INTO resumes (userId, title, template, content, updatedAt)
                 VALUES (?, ?, ?, ?, NOW())`;

    db.sequelize.query(sql, {
        replacements: [userId, title, template, resumeData],
        type: db.Sequelize.QueryTypes.INSERT
    })
    .then(([result]) => {
        res.status(200).json({ message: 'Resume saved successfully', id: result });
    })
    .catch(err => {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Database error', error: err.message });
    });
});

module.exports = router; 