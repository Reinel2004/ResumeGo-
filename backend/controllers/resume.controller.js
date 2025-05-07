const db = require("../models");
const Resume = db.resumes;
const User = db.users;

exports.create = async (req, res) => {
    try {
        const resume = await Resume.create({
            userId: req.userId,
            title: req.body.title,
            template: req.body.template,
            content: req.body.content,
            isPublic: req.body.isPublic || false
        });

        res.status(201).send(resume);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findAll = async (req, res) => {
    try {
        const resumes = await Resume.findAll({
            where: { userId: req.userId }
        });
        res.send(resumes);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.findOne = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (!resume) {
            return res.status(404).send({ message: "Resume not found." });
        }

        res.send(resume);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (!resume) {
            return res.status(404).send({ message: "Resume not found." });
        }

        await resume.update({
            title: req.body.title,
            template: req.body.template,
            content: req.body.content,
            isPublic: req.body.isPublic
        });

        res.send({ message: "Resume updated successfully!" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const resume = await Resume.findOne({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (!resume) {
            return res.status(404).send({ message: "Resume not found." });
        }

        await resume.destroy();
        res.send({ message: "Resume deleted successfully!" });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}; 