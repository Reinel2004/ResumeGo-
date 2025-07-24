const express = require('express');
const fetch = require('node-fetch');
const config = require('../config/api.config');

const router = express.Router();

// POST /api/grammar-check
router.post('/grammar-check', async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid text field.' });
    }
    const apiKey = config.textgears.apiKey;
    if (!apiKey) {
        return res.status(500).json({ error: 'TextGears API key not configured.' });
    }
    try {
        const url = `https://api.textgears.com/grammar?key=${apiKey}&text=${encodeURIComponent(text)}&language=en-US`;
        const tgRes = await fetch(url);
        const data = await tgRes.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Grammar check failed.' });
    }
});

module.exports = router; 